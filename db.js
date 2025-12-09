// Dexie SchoolDB initialization
(function(){
  if (!window.Dexie) {
    console.error('Dexie.js not loaded. Please include Dexie before db.js');
    return;
  }
  const db = new Dexie('SchoolDB');
  db.version(1).stores({
    fees: '++id, studentName, amount, description, dueDate',
    payments: '++id, studentName, amountPaid, datePaid, parentName'
  });
  window.db = db;

  // Additional PaymentsDB (do not remove existing stores)
  if (!window.paymentsDB) {
    const paymentsDB = new Dexie('PaymentsDB');
    paymentsDB.version(1).stores({
      payments: '++id, parentName, studentName, amount, status, date'
    });
    window.paymentsDB = paymentsDB;
  }
})();
