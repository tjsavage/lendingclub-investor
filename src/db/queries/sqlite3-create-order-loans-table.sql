CREATE TABLE IF NOT EXISTS OrderLoans (
  orderId INTEGER,
  requestedAmount REAL,
  portfolioId INTEGER,
  id INTEGER,
  memberId INTEGER,
  loanAmount REAL,
  fundedAmount REAL,
  term INTEGER,
  intRate REAL,
  expDefaultRate REAL,
  serviceFeeRate REAL,
  installment REAL,
  grade TEXT,
  subGrade TEXT,
  empLength REAL,
  homeOwnership TEXT,
  annualInc REAL,
  isIncV TEXT,
  acceptD DATETIME,
  expD DATETIME,
  listD DATETIME,
  creditPullD DATETIME,
  reviewStatusD TEXT,
  reviewStatus TEXT,
  desc TEXT,
  purpose TEXT,
  addrZip TEXT,
  addrState TEXT,
  investorCount INTEGER,
  ilsExpD DATETIME,
  initialListStatus TEXT,
  empTitle TEXT,
  accNowDelinq INTEGER,
  accOpenPast24Mths INTEGER,
  bcOpenToBuy INTEGER,
  percentBcGt75 REAL,
  bcUtil REAL,
  dti REAL,
  delinq2Yrs REAL,
  delinqAmnt REAL,
  earliestCrLine DATETIME,
  ficoRangeLow REAL,
  ficoRangeHigh REAL,
  inqLast6Mths INTEGER,
  mthsSinceLastDelinq INTEGER,
  mthsSinceLastRecord INTEGER,
  mthsSinceRecentInq INTEGER,
  mthsSinceRecentRevolDelinq INTEGER,
  mthsSinceRecentBc INTEGER,
  mortAcc INTEGER,
  openAcc INTEGER,
  pubRec INTEGER,
  totalBalExMort REAL,
  revolBal REAL,
  revolUtil REAL,
  totalBcLimit REAL,
  totalAcc INTEGER,
  totalIlHighCreditLimit REAL,
  numRevAccts INTEGER,
  mthsSinceRecentBcDlq INTEGER,
  pubRecBankruptcies INTEGER,
  numAcctsEver120Ppd INTEGER,
  chargeoffWithin12Mths INTEGER,
  collections12MthsExMed INTEGER,
  taxLiens INTEGER,
  mthsSinceLastMajorDerog INTEGER,
  numSats INTEGER,
  numTlOpPast12m INTEGER,
  moSinRcntTl INTEGER,
  totHiCredLim REAL,
  totCurBal REAL,
  avgCurBal REAL,
  numBcTl INTEGER,
  numActvBcTl INTEGER,
  numBcSats INTEGER,
  pctTlNvrDlq REAL,
  numTl90gDpd24m INTEGER,
  numTl30dpd INTEGER,
  numTl120dpd2m INTEGER,
  numIlTl INTEGER,
  moSinOldIlAcct INTEGER,
  numActvRevTl INTEGER,
  moSinOldRevTlOp INTEGER,
  moSinRcntRevTlOp INTEGER,
  totalRevHiLim REAL,
  numRevTlBalGt0 INTEGER,
  numOpRevTl INTEGER,
  totCollAmt REAL,
  applicationType TEXT,
  annualIncJoint REAL,
  dtiJoint REAL,
  isIncVJoint TEXT,
  openAcc6m INTEGER,
	openIl6m INTEGER,
	openIl12m INTEGER,
	openIl24m INTEGER,
	mthsSinceRcntIl INTEGER,
	totalBalIl REAL,
	iLUtil REAL,
	openRv12m INTEGER,
	openRv24m INTEGER,
	maxBalBc REAL,
	allUtil REAL,
	totalCreditRv REAL,
	inqFi INTEGER,
	totalFiTl INTEGER,
	inqLast12m
)
