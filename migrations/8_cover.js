const Claims = artifacts.require('Claims');
const ClaimsData = artifacts.require('ClaimsDataMock');
const ClaimsReward = artifacts.require('ClaimsReward');
const DAI = artifacts.require('MockDAI');
const DSValue = artifacts.require('DSValueMock');
const NXMaster = artifacts.require('NXMaster');
const MCR = artifacts.require('MCR');
const NXMToken = artifacts.require('NXMToken');
const TokenFunctions = artifacts.require('TokenFunctionMock');
const TokenController = artifacts.require('TokenController');
const TokenData = artifacts.require('TokenDataMock');
const Pool1 = artifacts.require('Pool1Mock');
const Pool2 = artifacts.require('Pool2');
const PoolData = artifacts.require('PoolDataMock');
const Quotation = artifacts.require('Quotation');
const QuotationDataMock = artifacts.require('QuotationDataMock');
const MemberRoles = artifacts.require('MemberRoles');
const Governance = artifacts.require('Governance');
const ProposalCategory = artifacts.require('ProposalCategory');
const FactoryMock = artifacts.require('FactoryMock');
const BN = web3.utils.BN;
const getQuoteValues = require('../test/utils/getQuote.js').getQuoteValues;

const UNLIMITED_ALLOWANCE = new BN((2).toString())
  .pow(new BN((256).toString()))
  .sub(new BN((1).toString()));

const POOL_ASSET = (50 * 10 ** 18).toString();
const INSURED_ADDRESS = '0x0000000000000000000000000000000000000001';
const coverPeriod = 61;
const coverDetails = [
  1, // sum assured
  '3362445813369838', // premium
  '744892736679184', // premium nxm
  '7972408607', // expire
  '7972408607000' // timestamp
];

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    const nxms = await NXMaster.deployed();
    const Owner = accounts[0];
    const tf = await TokenFunctions.deployed();
    const p1 = await Pool1.deployed();
    const pd = await PoolData.deployed();
    const mcr = await MCR.deployed();
    qt = await Quotation.deployed();
    console.log(
      'staked',
      (await tf.getTotalStakedTokensOnSmartContract(INSURED_ADDRESS)).toString()
    );
    const vrs = await getQuoteValues(
      coverDetails,
      '0x455448', // eth in hex
      coverPeriod,
      INSURED_ADDRESS,
      qt.address
    );
    console.log('vrs', vrs);
    let mrAddress = await nxms.getLatestAddress('0x4d52');
    mr = await MemberRoles.at(mrAddress);
    if ((await mr.totalRoles()).toString() == '0') {
      console.log('mr.memberRolesInitiate');
      await mr.memberRolesInitiate(Owner, Owner);
    }
    console.log('roles', (await mr.totalRoles()).toString());
    let pcAddress = await nxms.getLatestAddress('0x5043');
    pc = await ProposalCategory.at(pcAddress);
    if (!(await pc.constructorCheck())) {
      console.log('pc.proposalCategoryInitiate');
      await pc.proposalCategoryInitiate();
    }
    if (!(await mr.launched())) {
      console.log('mr.addMembersBeforeLaunch');
      await mr.addMembersBeforeLaunch([], [], {from: Owner});
    }
    if ((await pd.capReached()) != 1) {
      console.log('mcr.addMCRData');
      await mcr.addMCRData(
        13000,
        '100000000000000000000',
        '7000000000000000000000',
        ['0x455448', '0x444149'],
        [100, 15517],
        20190103
      );
    }
    console.log('p1.makeCoverBegin');
    await p1.makeCoverBegin(
      INSURED_ADDRESS,
      '0x455448', // eth in hex
      coverDetails,
      coverPeriod,
      vrs[0],
      vrs[1],
      vrs[2],
      {from: Owner, value: coverDetails[1]}
    );
    // coverID = await qd.getAllCoversOfUser(coverHolder);
    // throw new Error("bbleh");
  });
};
