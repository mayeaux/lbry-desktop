// @flow
import React from 'react';
import classnames from 'classnames';
import { useHistory, withRouter } from 'react-router-dom';
// import useGetThumbnail from 'effects/use-get-thumbnail';
// import { formatLbryUrlForWeb } from 'util/url';
import * as PAGES from 'constants/pages';
import * as ICONS from 'constants/icons';
// import { COLLECTIONS_CONSTS } from 'lbry-redux';
import Button from 'component/button';
import Card from 'component/common/card';
import ClaimPreviewTile from 'component/claimPreviewTile';
import UriIndicator from '../uriIndicator';
import ChannelThumbnail from 'component/channelThumbnail';
import DateTime from 'component/dateTime';
import Icon from 'component/common/icon';

type Props = {
  uri: string,
  collectionId: string,
  collectionName: string,
  collectionCount: number,
  editedCollection?: Collection,
  pendingCollection?: Collection,
  claim: ?Claim,
  channelClaim: ?ChannelClaim,
  collectionItemUrls: Array<string>,
  resolveUri: (string) => void,
  isResolvingUri: boolean,
  history: { push: (string) => void },
  thumbnail?: string,
  title?: string,
  placeholder: boolean,
  blackListedOutpoints: Array<{
    txid: string,
    nout: number,
  }>,
  filteredOutpoints: Array<{
    txid: string,
    nout: number,
  }>,
  blockedChannelUris: Array<string>,
  isMature?: boolean,
  showMature: boolean,
  collectionId: string,
  deleteCollection: (string) => void,
  resolveCollectionItems: (any) => void,
};

function CollectionPreviewTile(props: Props) {
  const {
    // history,
    uri,
    collectionId,
    collectionName,
    collectionCount,
    isResolvingUri,
    // thumbnail,
    // title,
    claim,
    channelClaim,
    collectionItemUrls,
    blackListedOutpoints,
    filteredOutpoints,
    blockedChannelUris,
    isMature,
    showMature,
    // editedCollection,
    // pendingCollection,
    resolveCollectionItems,
  } = props;
  // const shouldFetch = claim === undefined;
  // const canonicalUrl = claim && claim.canonical_url; uncomment after sdk resolve fix
  const { push } = useHistory();

  const hasClaim = Boolean(claim);
  React.useEffect(() => {
    if (collectionId && hasClaim && resolveCollectionItems) {
      resolveCollectionItems({ collectionId, page_size: 5 });
    }
  }, [collectionId, hasClaim]);

  const channelUrl = channelClaim && channelClaim.permanent_url;
  // const firstCollectionUrl = collectionItemUrls[0];
  // let navigateUrl = firstCollectionUrl && formatLbryUrlForWeb(firstCollectionUrl);
  // if (collectionId) {
  //   const collectionParams = new URLSearchParams();
  //   collectionParams.set(COLLECTIONS_CONSTS.COLLECTION_ID, collectionId);
  //   navigateUrl = navigateUrl + `?` + collectionParams.toString();
  // }
  // // const navigateUrl = formatLbryUrlForWeb(permanentUrl || uri || `/$/${PAGES.COLLECTION}/${collectionId}`);
  //
  const signingChannel = claim && claim.signing_channel;
  // let channelThumbnail;
  // if (signingChannel) {
  //   channelThumbnail =
  //     // I should be able to just pass the the uri to <ChannelThumbnail /> but it wasn't working
  //     // Come back to me
  //     (signingChannel.value && signingChannel.value.thumbnail && signingChannel.value.thumbnail.url) || undefined;
  // }
  //
  // function handleClick(e) {
  //   // go to first url + collectionId
  //   if (navigateUrl) {
  //     history.push(navigateUrl);
  //   }
  // }

  let shouldHide = false;

  if (isMature && !showMature) {
    // Unfortunately needed until this is resolved
    // https://github.com/lbryio/lbry-sdk/issues/2785
    shouldHide = true;
  }

  // This will be replaced once blocking is done at the wallet server level
  if (claim && !shouldHide && blackListedOutpoints) {
    shouldHide = blackListedOutpoints.some(
      (outpoint) =>
        (signingChannel && outpoint.txid === signingChannel.txid && outpoint.nout === signingChannel.nout) ||
        (outpoint.txid === claim.txid && outpoint.nout === claim.nout)
    );
  }
  // We're checking to see if the stream outpoint
  // or signing channel outpoint is in the filter list
  if (claim && !shouldHide && filteredOutpoints) {
    shouldHide = filteredOutpoints.some(
      (outpoint) =>
        (signingChannel && outpoint.txid === signingChannel.txid && outpoint.nout === signingChannel.nout) ||
        (outpoint.txid === claim.txid && outpoint.nout === claim.nout)
    );
  }

  // block stream claims
  if (claim && !shouldHide && blockedChannelUris.length && signingChannel) {
    shouldHide = blockedChannelUris.some((blockedUri) => blockedUri === signingChannel.permanent_url);
  }
  // block channel claims if we can't control for them in claim search
  // e.g. fetchRecommendedSubscriptions

  if (shouldHide) {
    return null;
  }

  if (isResolvingUri) {
    return (
      <li className={classnames('claim-preview--tile', {})}>
        <div className="placeholder media__thumb" />
        <div className="placeholder__wrapper">
          <div className="placeholder claim-tile__title" />
          <div className="placeholder claim-tile__info" />
        </div>
      </li>
    );
  }

  if (collectionItemUrls && collectionItemUrls.length > 0) {
    return (
      <li className="collection-preview claim-preview--tile">
        <Card
          title={
            <Button
              label={<div className="claim-grid__title">{collectionName}</div>}
              button="link"
              navigate={`/$/${PAGES.COLLECTION}/${collectionId}`}
            />
          }
          role={'button'}
          onClick={() => push(`/$/${PAGES.COLLECTION}/${collectionId}`)}
          body={
            <div className="collection-preview__items">
              {collectionItemUrls.slice(0, 1).map((uri) => (
                <ClaimPreviewTile collectionId={collectionId} uri={uri} key={'tile' + uri} />
              ))}
            </div>
          }
          // actions={<ClaimAuthor uri={uri} />}
          actions={
            <div className="claim-tile-collection__info">
              {uri ? (
                <React.Fragment>
                  <UriIndicator uri={uri} link hideAnonymous>
                    <ChannelThumbnail uri={channelUrl} />
                  </UriIndicator>

                  <div className="claim-tile__about">
                    <UriIndicator uri={uri} link />
                    <span>
                      <DateTime timeAgo uri={uri} />
                      <Icon icon={ICONS.STACK} />
                      {collectionCount}
                    </span>
                  </div>
                </React.Fragment>
              ) : (
                <span>
                  Private
                  <Icon icon={ICONS.STACK} />
                  {collectionCount}
                </span>
              )}
            </div>
          }
        />
      </li>
    );
  }
  return (
    <li className="collection-preview claim-preview--tile">
      <Card
        title={<div className="claim-grid__title">{collectionName}</div>}
        actions={
          <div className="collection-preview__items">
            <h1>No items</h1>
          </div>
        }
      />
    </li>
  );
}

export default withRouter(CollectionPreviewTile);
