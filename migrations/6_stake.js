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

const UNLIMITED_ALLOWANCE = new BN((2).toString())
  .pow(new BN((256).toString()))
  .sub(new BN((1).toString()));

const POOL_ASSET = (50 * 10 ** 18).toString();
const INSURED_ADDRESS = '0x0000000000000000000000000000000000000001';
const coverPeriod = 61;
const coverDetails = [
  1,
  '3362445813369838',
  '744892736679184',
  '7972408607',
  '7972408607000'
];

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    const Owner = accounts[0];
    const nxms = await NXMaster.deployed();
    const tf = await TokenFunctions.deployed();
    const td = await TokenData.deployed();
    const tk = await NXMToken.deployed();
    console.log('nxms', nxms.address);
    console.log('tf', tf.address);
    // await tf.mint(Owner, POOL_ASSET);
    console.log('tk balance', (await tk.balanceOf(Owner)).toString());
    console.log('is pause', await nxms.isPause());
    console.log('is member', await nxms.isMember(Owner));
    console.log('valid days', (await td.scValidDays()).toString());
    const operator = await tk.operator();
    console.log('operator', operator);
    await tk.approve(operator, UNLIMITED_ALLOWANCE, {from: Owner});
    // throw new Error("bbleh");
    await tf.addStake(INSURED_ADDRESS, POOL_ASSET, {from: Owner});
    console.log(
      (await tf.getTotalStakedTokensOnSmartContract(INSURED_ADDRESS)).toString()
    );
    // throw new Error("bbleh");
  });
};
