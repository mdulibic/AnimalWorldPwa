var dbPromise = idb.open('encyclopedias-store', 1, function(db){
    if(!db.objectStoreNames.contains('sync-encyclopedias')){
        db.createObjectStore('sync-encyclopedias', {keyPath: 'id'});
    }
});

function writeData(st, data) {
    return dbPromise
    .then(function(db){
        var tx = db.transaction(st, 'readwrite');
        var store = tx.objectStore(st);
        store.put(data);
        return tx.complete;
    });
}


function readAllData(st) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(st, 'readonly');
            var store = tx.objectStore(st);
            return store.getAll();
        });
    
}

function clearAllData(st) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.clear();
            return tx.complete;
        })
    
}

function deleteItem(st, id) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.delete(id);
            return tx.complete;
        })
}