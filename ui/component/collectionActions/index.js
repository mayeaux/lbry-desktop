import { connect } from 'react-redux';
import {
  makeSelectClaimIsMine,
  makeSelectClaimForUri,
  // doPrepareEdit, // do the collection edit/publish
  selectMyChannelClaims,
  makeSelectClaimIsPending,
  makeSelectCollectionIsMine,
} from 'lbry-redux';
import { makeSelectCostInfoForUri } from 'lbryinc';
import { doToast } from 'redux/actions/notifications';
import { doOpenModal } from 'redux/actions/app';
import CollectionActions from './view';

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  claimIsMine: makeSelectClaimIsMine(props.uri)(state),
  costInfo: makeSelectCostInfoForUri(props.uri)(state),
  myChannels: selectMyChannelClaims(state),
  claimIsPending: makeSelectClaimIsPending(props.uri)(state),
  isMyCollection: makeSelectCollectionIsMine(props.collectionId)(state),
});

const perform = (dispatch) => ({
  openModal: (modal, props) => dispatch(doOpenModal(modal, props)),
  // prepareEdit: (publishData, uri, fileInfo) => {
  //   if (publishData.signing_channel) {
  //     dispatch(doSetIncognito(false));
  //     dispatch(doSetActiveChannel(publishData.signing_channel.claim_id));
  //   } else {
  //     dispatch(doSetIncognito(true));
  //   }
  //
  //   dispatch(doPrepareEdit(publishData, uri, fileInfo, fs));
  // },
  doToast: (options) => dispatch(doToast(options)),
});

export default connect(select, perform)(CollectionActions);
