const cron = require('node-cron');
const mongoose = require('mongoose');
const Airport = require('../models/Airport');
const SyncMeta = require('../models/SyncMeta');
const { client: esClient } = require('../elastic/client');

const airportSyncJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const syncMeta = await SyncMeta.findOne({ name: 'airport_sync' });
      const lastId = syncMeta?.lastSyncedObjectId;

      const query = lastId
        ? { _id: { $gt: mongoose.Types.ObjectId(lastId) } }
        : {};
      const newAirports = await Airport.find(query).sort({ _id: 1 });

      if (newAirports.length === 0) return;

      const operations = newAirports.flatMap(doc => [
        { index: { _index: 'airports', _id: doc._id.toString() } },
        doc.toObject(),
      ]);

    //   await esClient.bulk({ refresh: true, operations });

    //   const newLastId = newAirports[newAirports.length - 1]._id.toString();
    //   await SyncMeta.updateOne(
    //     { name: 'airport_sync' },
    //     { $set: { lastSyncedObjectId: newLastId } },
    //     { upsert: true }
    //   );

    //   console.log(` Synced ${newAirports.length} new airports`);
    } catch (err) {
      console.error('Sync failed:', err);
    }
  });
};

module.exports = airportSyncJob;
