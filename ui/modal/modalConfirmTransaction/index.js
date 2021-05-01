import { connect } from 'react-redux';
import {
  doSendDraftTransaction,
  makeSelectTitleForUri,
  makeSelectClaimForUri,
  makeSelectThumbnailForUri,
  doSendTip
} from 'lbry-redux';
import { doHideModal } from 'redux/actions/app';
import ModalConfirmTransaction from './view';

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.destination)(state),
  claimTitle: makeSelectTitleForUri(props.destination)(state),
  thumbnailUrl: makeSelectThumbnailForUri(props.destination)(state),
});

const perform = dispatch => ({
  closeModal: () => dispatch(doHideModal()),
  sendToAddress: (address, amount) => dispatch(doSendDraftTransaction(address, amount)),
  sendTip: (params, isSupport) => dispatch(doSendTip(params, isSupport)),
});

export default connect(select, perform)(ModalConfirmTransaction);
