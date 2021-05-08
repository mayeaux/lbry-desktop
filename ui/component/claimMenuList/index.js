import { connect } from 'react-redux';
import {
  doCollectionEdit,
  makeSelectClaimForUri,
  makeSelectClaimIsMine,
  makeSelectCollectionForIdHasClaimUrl,
} from 'lbry-redux';
import { makeSelectChannelIsMuted } from 'redux/selectors/blocked';
import { doToggleMuteChannel } from 'redux/actions/blocked';
import { doCommentModBlock, doCommentModUnBlock } from 'redux/actions/comments';
import { makeSelectChannelIsBlocked } from 'redux/selectors/comments';
import { doOpenModal } from 'redux/actions/app';
import ClaimPreview from './view';

const select = (state, props) => {
  const claim = makeSelectClaimForUri(props.uri)(state);
  const permanentUri = claim && claim.permanent_url;
  return {
    claim,
    claimIsMine: makeSelectClaimIsMine(props.uri)(state),
    hasClaimInWatchLater: makeSelectCollectionForIdHasClaimUrl('watchlater', permanentUri)(state),
    channelIsMuted: makeSelectChannelIsMuted(props.uri)(state),
    channelIsBlocked: makeSelectChannelIsBlocked(props.uri)(state),
  };
};

export default connect(select, {
  doToggleMuteChannel,
  doCommentModBlock,
  doCommentModUnBlock,
  doCollectionEdit,
  doOpenModal,
})(ClaimPreview);
