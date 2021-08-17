// @flow
import * as ICONS from 'constants/icons';
import * as MODALS from 'constants/modal_types';
import * as PAGES from 'constants/pages';
import React from 'react';
import CreditAmount from 'component/common/credit-amount';
import Button from 'component/button';
import HelpLink from 'component/common/help-link';
import Card from 'component/common/card';
import LbcSymbol from 'component/common/lbc-symbol';
import I18nMessage from 'component/i18nMessage';
import { formatNumberWithCommas } from 'util/number';
import Icon from 'component/common/icon';

type Props = {
  balance: number,
  totalBalance: number,
  claimsBalance: number,
  supportsBalance: number,
  tipsBalance: number,
  doOpenModal: (string) => void,
  hasSynced: boolean,
  doFetchUtxoCounts: () => void,
  doUtxoConsolidate: () => void,
  fetchingUtxoCounts: boolean,
  consolidatingUtxos: boolean,
  consolidateIsPending: boolean,
  massClaimingTips: boolean,
  massClaimIsPending: boolean,
  utxoCounts: { [string]: number },
};

export const WALLET_CONSOLIDATE_UTXOS = 400;
const LARGE_WALLET_BALANCE = 100;

const WalletBalance = (props: Props) => {
  const {
    balance,
    claimsBalance,
    supportsBalance,
    tipsBalance,
    doOpenModal,
    hasSynced,
    doUtxoConsolidate,
    doFetchUtxoCounts,
    consolidatingUtxos,
    consolidateIsPending,
    massClaimingTips,
    massClaimIsPending,
    utxoCounts,
  } = props;
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);

  const { other: otherCount = 0 } = utxoCounts || {};

  const totalBalance = balance + tipsBalance + supportsBalance + claimsBalance;
  const totalLocked = tipsBalance + claimsBalance + supportsBalance;
  const operationPending = massClaimIsPending || massClaimingTips || consolidateIsPending || consolidatingUtxos;

  React.useEffect(() => {
    if (balance > LARGE_WALLET_BALANCE && detailsExpanded) {
      doFetchUtxoCounts();
    }
  }, [doFetchUtxoCounts, balance, detailsExpanded]);

  return (
    <Card
      title={<><LbcSymbol postfix={formatNumberWithCommas(totalBalance)} isTitle /> / <Icon size={18} icon={ICONS.FINANCE} />35 USD</>}
      subtitle={
        totalLocked > 0 ? (
          <I18nMessage tokens={{ lbc: <LbcSymbol /> }}>
            Your total balance in LBRY Credits and US Dollars
          </I18nMessage>
        ) : (
          <span>{__('Your total balance.')}</span>
        )
      }
      style={{ marginBottom: '20px' }}
    />
  );
};

export default WalletBalance;
