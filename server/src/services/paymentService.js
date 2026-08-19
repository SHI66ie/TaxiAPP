// Nigerian Ride-Hailing Payment & Driver Settlement Engine (Paystack, Flutterwave, NIBSS, Wallet & Cash)

let driverWallets = [
  { driverId: 'drv_101', driverName: 'Ibrahim Danladi', bankName: 'Guaranty Trust Bank (GTBank)', accountNumber: '0123456789', balance: 14500, status: 'VERIFIED' },
  { driverId: 'drv_102', driverName: 'Chidi Okonkwo', bankName: 'Zenith Bank', accountNumber: '2233445566', balance: 22100, status: 'VERIFIED' },
  { driverId: 'drv_103', driverName: 'Musa Abdullahi', bankName: 'OPay Digital Bank', accountNumber: '8143337788', balance: 8300, status: 'VERIFIED' }
];

let paymentTransactions = [
  {
    id: 'tx_paystack_8801',
    rideId: 'ride_901',
    passengerName: 'Amina Bello',
    amount: 3800,
    currency: 'NGN (₦)',
    gateway: 'Paystack',
    channel: 'Debit Card (Mastercard / Visa / Verve)',
    reference: 'ABJ_PAY_1723901',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'tx_flw_8802',
    rideId: 'ride_902',
    passengerName: 'Kemi Olusola',
    amount: 2100,
    currency: 'NGN (₦)',
    gateway: 'Flutterwave',
    channel: 'Bank Transfer (USSD *737#)',
    reference: 'ABJ_FLW_99812',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString()
  }
];

export function getPaymentMethods() {
  return [
    { id: 'paystack', name: 'Paystack Nigeria', desc: 'Debit Card, USSD (*737#), Bank Transfer, Apple Pay', status: 'ACTIVE', isPrimary: true },
    { id: 'flutterwave', name: 'Flutterwave', desc: 'NIBSS Instant Transfer, Mobile Money, Cards', status: 'ACTIVE', isPrimary: false },
    { id: 'wallet', name: 'Abuja Express Wallet', desc: 'Rider in-app wallet balance', status: 'ACTIVE', isPrimary: false },
    { id: 'cash_pos', name: 'Cash / In-Car POS', desc: 'Driver physical cash or POS terminal payment', status: 'ACTIVE', isPrimary: false }
  ];
}

export function initializePayment({ amount, email, channel, rideId, passengerName }) {
  const ref = `ABJ_${(channel || 'PAYSTACK').toUpperCase()}_${Date.now()}`;
  const transaction = {
    id: `tx_${Date.now().toString().slice(-6)}`,
    rideId: rideId || 'ride_test',
    passengerName: passengerName || 'Abuja Rider',
    amount: Number(amount) || 2500,
    currency: 'NGN (₦)',
    gateway: channel === 'flutterwave' ? 'Flutterwave' : 'Paystack',
    channel: channel === 'flutterwave' ? 'NIBSS Instant Bank Transfer' : 'Debit Card / USSD *737#',
    reference: ref,
    status: 'PENDING',
    timestamp: new Date().toISOString()
  };

  paymentTransactions.unshift(transaction);

  return {
    transaction,
    checkoutUrl: `https://checkout.${channel || 'paystack'}.com/pay/${ref}`,
    virtualAccountNumber: '9928104812',
    bankName: 'Wema Bank (Paystack Dedicated Account)',
    ussdCode: '*737*000*9912#'
  };
}

export function verifyPayment(reference) {
  const tx = paymentTransactions.find(t => t.reference === reference || t.id === reference);
  if (tx) {
    tx.status = 'SUCCESS';
    return tx;
  }
  if (paymentTransactions[0]) {
    paymentTransactions[0].status = 'SUCCESS';
    return paymentTransactions[0];
  }
  throw new Error('Transaction reference not found');
}

export function getDriverWallets() {
  return driverWallets;
}

export function requestDriverPayout({ driverId, amount, bankName, accountNumber }) {
  const wallet = driverWallets.find(w => w.driverId === driverId);
  if (!wallet) throw new Error('Driver wallet not found');

  const payoutAmount = Number(amount);
  if (wallet.balance < payoutAmount) {
    throw new Error('Insufficient wallet balance for NIBSS transfer');
  }

  wallet.balance -= payoutAmount;

  const payoutTx = {
    id: `payout_${Date.now().toString().slice(-6)}`,
    driverId,
    driverName: wallet.driverName,
    bankName: bankName || wallet.bankName,
    accountNumber: accountNumber || wallet.accountNumber,
    amount: payoutAmount,
    status: 'SETTLED',
    nibssReference: `NIBSS_ABJ_${Math.floor(10000000 + Math.random() * 90000008)}`,
    timestamp: new Date().toISOString()
  };

  return payoutTx;
}

export function getPaymentHistory() {
  return paymentTransactions;
}

export function getDriverEarnings(driverId) {
  const transactions = paymentTransactions.filter(t => t.status === 'SUCCESS'); // Simplified for MVP
  // In a real app, you'd filter by driverId in the ride record associated with the transaction

  const today = new Date().toISOString().split('T')[0];
  const todayEarnings = transactions
    .filter(t => t.timestamp.startsWith(today))
    .reduce((sum, t) => sum + (t.amount * 0.85), 0);

  const weeklyEarnings = transactions
    .reduce((sum, t) => sum + (t.amount * 0.85), 0);

  return {
    todayTotal: Math.round(todayEarnings),
    weeklyTotal: Math.round(weeklyEarnings),
    transactions: transactions.map(t => ({
      id: t.id,
      rideId: t.rideId,
      amount: Math.round(t.amount * 0.85),
      timestamp: t.timestamp
    }))
  };
}
