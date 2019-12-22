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
const CLA = '0x434c41';
const tokens = (50 * 10 ** 18).toString();
const validitySeconds = 30 * 24 * 60 * 60;
const BN = web3.utils.BN;
const UNLIMITED_ALLOWANCE = new BN((2).toString())
  .pow(new BN((256).toString()))
  .sub(new BN((1).toString()));

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    const nxms = await NXMaster.deployed();
    const Owner = accounts[0];
    // const tf = await TokenFunctions.deployed();
    // const tc = await TokenController.deployed();
    // const pl2 = await Pool2.deployed();
    const pd = await PoolData.deployed();
    const cd = await ClaimsData.deployed();
    const cl = await Claims.deployed();
    const cr = await ClaimsReward.deployed();
    const tk = await NXMToken.deployed();
    console.log(
      'Enough balance',
      parseInt(tokens) <= parseInt((await tk.balanceOf(Owner)).toString())
    );
    const tcAddress = await nxms.getLatestAddress('0x5443');
    const tc = await TokenController.at(tcAddress);
    if ((await tk.allowance(Owner, tc.address)).toString() == '0') {
      console.log('tk.approve');
      await tk.approve(tc.address, UNLIMITED_ALLOWANCE, {from: Owner});
    }
    if ((await tc.tokensLocked(Owner, CLA)).toString() == '0') {
      console.log('tc.lock');
      await tc.lock(CLA, tokens, validitySeconds, {from: Owner});
    }
    const claimId = (await cd.getUserClaimByIndex(0, Owner)).claimId;
    console.log('claimId', claimId.toString());
    if ((await cl.checkVoteClosing(claimId)).toString() == '1') {
      console.log('closing vote');
      const len = parseInt((await pd.getApilCallLength()).toString());
      for (let i = 0; i < len; i++) {
        const id = await pd.getApiCallIndex(i);
        const api = await pd.getApiCallDetails(id);
        if (api._typeof == CLA + '00') {
          console.log('sending callback to', id);
          await nxms.delegateCallBack(id);
        }
      }
    }
    const status = (await cd.getClaimStatusNumber(claimId)).statno.toString();
    console.log('claimStatus', status);
    if (status == '0') {
      if ((await cd.getUserClaimVoteCA(Owner, claimId)).toString() == '0') {
        console.log('cl.submitCAVote');
        await cl.submitCAVote(claimId, 1, {from: Owner});
      }
    } else if (status == '2' || status == '3') {
      if ((await cd.getUserClaimVoteMember(Owner, claimId)).toString() == '0') {
        console.log('cl.submitMemberVote');
        await cl.submitMemberVote(claimId, 1, {from: Owner});
      }
    }
    throw 'bleh';
    console.log(tokens);
  });
};
