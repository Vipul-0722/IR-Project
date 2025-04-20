const mongoose = require('mongoose');
const SyncMetaSchema = new mongoose.Schema({
    lastSyncedObjectId: String, 
     name: String,
  });
  
  const SyncMeta = mongoose.model('SyncMeta', SyncMetaSchema);
  