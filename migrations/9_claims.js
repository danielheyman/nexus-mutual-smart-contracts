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

const POOL_ASSET = (50 * 10 ** 18).toString();

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    const nxms = await NXMaster.deployed();
    const Owner = accounts[0];
    const tf = await TokenFunctions.deployed();
    const tc = await TokenController.deployed();
    const pl2 = await Pool2.deployed();
    const pd = await PoolData.deployed();
    const cd = await ClaimsData.deployed();
    const cl = await Claims.deployed();
    const qd = await QuotationDataMock.deployed();
    if ((await pd.getLastDate()).toString() == '0') {
      console.log('Submitting IA Details');
      const dai = await DAI.deployed();
      await pl2.saveIADetails(
        ['0x455448', '0x444149'],
        [100, 15517],
        20190103,
        true
      ); //testing
      await dai.transfer(pl2.address, POOL_ASSET);
    }
    if ((await cd.getUserClaimCount(Owner)).toString() == '0') {
      console.log('cl.submitClaim');
      const covers = await qd.getAllCoversOfUser(Owner);
      await cl.submitClaim(covers[0], {from: Owner});
    }
  });
};
