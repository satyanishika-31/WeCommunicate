const Community = require("../models/Community");
const Block = require("../models/Block");
const House = require("../models/House");
const User = require("../models/User");

const syncDatabase = async () => {
  try {
    console.log("==> Running database sync and data mapping validation...");

    // Drop legacy blockNumber_1 unique index if it exists
    try {
      await Block.collection.dropIndex("blockNumber_1");
      console.log("Dropped legacy blockNumber_1 unique index");
    } catch (e) {
      // index already dropped or not existing
    }

    const communities = await Community.find();

    for (const community of communities) {
      if (community.communityHead) {
        await User.findByIdAndUpdate(community.communityHead, {
          role: "COMMUNITY_HEAD",
          community: community.name
        });
      }

      let blocksList = community.blocksList || [];
      if (!blocksList || blocksList.length === 0) {
        blocksList = ["Block A", "Block B", "Block C", "Block D"];
        community.blocksList = blocksList;
        community.totalBlocks = blocksList.length;
        await community.save();
      }

      const defaultFlats = [
        "101", "102", "103", "104", "105", "106",
        "201", "202", "203", "204", "205", "206",
        "301", "302", "303", "304", "305", "306"
      ];
      let flatsList = community.flatsList || [];
      if (!flatsList || flatsList.length === 0) {
        flatsList = defaultFlats;
        community.flatsList = flatsList;
        community.totalFlats = flatsList.length * blocksList.length;
        await community.save();
      }

      // Ensure each block document exists in Block collection
      for (const bName of blocksList) {
        let blockDocs = await Block.find({ community: community.name, name: bName });
        let blockDoc = blockDocs[0];
        if (!blockDoc) {
          blockDoc = await Block.create({
            name: bName,
            blockNumber: bName,
            community: community.name,
            totalHouses: flatsList.length || 18,
            description: `${bName} in ${community.name}`
          });
          console.log(`Created missing Block: ${bName} in ${community.name}`);
        } else {
          if (blockDocs.length > 1) {
            for (let i = 1; i < blockDocs.length; i++) {
              await Block.deleteOne({ _id: blockDocs[i]._id });
            }
          }
          if (!blockDoc.totalHouses || blockDoc.totalHouses < flatsList.length) {
            blockDoc.totalHouses = flatsList.length || 18;
            await blockDoc.save();
          }
        }

        // Ensure baseline houses exist for each flat in this block
        for (const flatNum of flatsList) {
          const existingHouse = await House.findOne({ block: blockDoc._id, houseNumber: flatNum });
          if (!existingHouse) {
            await House.create({
              block: blockDoc._id,
              houseNumber: flatNum,
              flatNumber: flatNum,
              status: "VACANT"
            });
          }
        }
      }
    }

    // Now validate and link every User
    const users = await User.find();
    for (const user of users) {
      let updated = false;

      // Ensure flatNumber is synced
      if (!user.flatNumber && user.houseNumber) {
        user.flatNumber = user.houseNumber;
        updated = true;
      } else if (!user.houseNumber && user.flatNumber) {
        user.houseNumber = user.flatNumber;
        updated = true;
      }

      // If user has a community, ensure block is linked
      if (user.community) {
        const communityBlocks = await Block.find({ community: user.community });
        if (communityBlocks.length > 0) {
          let matchedBlock = null;

          if (user.block) {
            matchedBlock = communityBlocks.find(b => b._id.toString() === user.block.toString());
          }

          if (!matchedBlock && user.houseNumber) {
            const hNumLower = user.houseNumber.toLowerCase();
            matchedBlock = communityBlocks.find(b => {
              const bName = b.name.toLowerCase();
              const bLetter = bName.replace('block', '').trim();
              return hNumLower.includes(bName) || 
                     hNumLower.startsWith(bLetter + '-') || 
                     hNumLower.includes('block ' + bLetter) ||
                     hNumLower.includes(bLetter + '-block');
            });
          }

          if (!matchedBlock) {
            matchedBlock = communityBlocks[0];
          }

          if (!user.block || user.block.toString() !== matchedBlock._id.toString()) {
            user.block = matchedBlock._id;
            updated = true;
          }

          // Link to House
          let cleanFlatNumber = user.houseNumber || user.flatNumber || "101";
          // If cleanFlatNumber has block prefix like "Block A-102", keep the base flat number for house record or clean it
          let houseDoc = await House.findOne({
            block: matchedBlock._id,
            $or: [
              { houseNumber: cleanFlatNumber },
              { flatNumber: cleanFlatNumber },
              { houseNumber: cleanFlatNumber.replace(/^(Block\s+[A-Z]-?|[A-Z]-?|[a-z]-block-?)/i, '') }
            ]
          });

          if (!houseDoc) {
            houseDoc = await House.create({
              block: matchedBlock._id,
              houseNumber: cleanFlatNumber,
              flatNumber: cleanFlatNumber,
              residents: [user._id],
              owner: user.residentType === 'OWNER' ? user._id : undefined,
              status: user.residentType === 'TENANT' ? 'TENANT_OCCUPIED' : 'OWNER_OCCUPIED'
            });
          } else {
            if (!houseDoc.residents.includes(user._id)) {
              houseDoc.residents.push(user._id);
            }
            if (user.residentType === 'OWNER' && !houseDoc.owner) {
              houseDoc.owner = user._id;
            }
            houseDoc.status = user.residentType === 'TENANT' ? 'TENANT_OCCUPIED' : 'OWNER_OCCUPIED';
            await houseDoc.save();
          }

          if (!user.house || user.house.toString() !== houseDoc._id.toString()) {
            user.house = houseDoc._id;
            updated = true;
          }

          // If user is BLOCK_MANAGER, ensure block manager reference and assignedDate
          if (user.role === "BLOCK_MANAGER") {
            if (!user.assignedDate) {
              user.assignedDate = user.updatedAt || user.createdAt || new Date();
              updated = true;
            }
            if (!matchedBlock.manager || matchedBlock.manager.toString() !== user._id.toString()) {
              matchedBlock.manager = user._id;
              matchedBlock.managerAssignedDate = user.assignedDate;
              await matchedBlock.save();
            }
          }
        }
      }

      if (updated) {
        await user.save();
      }
    }

    console.log("==> Database sync completed successfully.");
  } catch (error) {
    console.error("Database sync error:", error);
  }
};

module.exports = syncDatabase;
