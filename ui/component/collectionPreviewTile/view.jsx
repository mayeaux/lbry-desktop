// @flow
import React from 'react';
import classnames from 'classnames';
import { NavLink, withRouter } from 'react-router-dom';
import UriIndicator from 'component/uriIndicator';
import TruncatedText from 'component/common/truncated-text';
import DateTime from 'component/dateTime';
import ChannelThumbnail from 'component/channelThumbnail';
import SubscribeButton from 'component/subscribeButton';
// import useGetThumbnail from 'effects/use-get-thumbnail';
import { formatLbryUrlForWeb } from 'util/url';
import ClaimPreview from 'component/claimPreview';
import * as PAGES from 'constants/pages';
import { COLLECTIONS_CONSTS } from 'lbry-redux';
import Button from 'component/button';
import * as ICONS from 'constants/icons';

type Props = {
  uri: string,
  collectionId: string,
  collectionName: string,
  editedCollection?: Collection,
  pendingCollection?: Collection,
  claim: ?Claim,
  channelClaim: ?ChannelClaim,
  collectionItemUrls: Array<string>,
  channel?: ?ChannelClaim,
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
    history,
    uri,
    collectionId,
    collectionName,
    isResolvingUri,
    // thumbnail,
    title,
    claim,
    // channelClaim,
    collectionItemUrls,
    blackListedOutpoints,
    filteredOutpoints,
    blockedChannelUris,
    isMature,
    showMature,
    deleteCollection,
    editedCollection,
    pendingCollection,
    resolveCollectionItems,
  } = props;
  // const shouldFetch = claim === undefined;
  // const canonicalUrl = claim && claim.canonical_url; uncomment after sdk resolve fix

  const hasClaim = Boolean(claim);
  React.useEffect(() => {
    if (collectionId && hasClaim && resolveCollectionItems) {
      resolveCollectionItems({ collectionId, page_size: 5 });
    }
  }, [collectionId, hasClaim]);

  // const channelUrl = channelClaim && channelClaim.permanent_url;
  const firstCollectionUrl = collectionItemUrls[0];
  let navigateUrl = firstCollectionUrl && formatLbryUrlForWeb(firstCollectionUrl);
  if (collectionId) {
    const collectionParams = new URLSearchParams();
    collectionParams.set(COLLECTIONS_CONSTS.COLLECTION_ID, collectionId);
    navigateUrl = navigateUrl + `?` + collectionParams.toString();
  }
  // const navigateUrl = formatLbryUrlForWeb(permanentUrl || uri || `/$/${PAGES.COLLECTION}/${collectionId}`);

  const firstUrl = collectionItemUrls && collectionItemUrls[0];
  const isChannel = false;
  const navLinkProps = {
    to: navigateUrl,
    onClick: (e) => e.stopPropagation(),
  };

  const signingChannel = claim && claim.signing_channel;
  let channelThumbnail;
  if (signingChannel) {
    channelThumbnail =
      // I should be able to just pass the the uri to <ChannelThumbnail /> but it wasn't working
      // Come back to me
      (signingChannel.value && signingChannel.value.thumbnail && signingChannel.value.thumbnail.url) || undefined;
  }

  function handleClick(e) {
    // go to first url + collectionId
    if (navigateUrl) {
      history.push(navigateUrl);
    }
  }

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

  // may want to incorporate collection thumb as well as content previews
  return (
    <li
      role="link"
      onClick={handleClick}
      className={classnames('card claim-preview--tile', {
        'claim-preview__wrapper--channel': false,
      })}
    >
      <NavLink {...navLinkProps}>
        <ClaimPreview uri={firstUrl} key={firstUrl} type={'small'} />
      </NavLink>
      <NavLink {...navLinkProps}>
        <h2 className="claim-tile__title">
          <Button
            button="link"
            label={
              <TruncatedText text={__('Collection: ') + (title || (claim && claim.name) || collectionName)} lines={2} />
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push(`/$/${PAGES.COLLECTION}/${collectionId}`);
            }}
          />
          <Button
            icon={ICONS.REMOVE}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteCollection(collectionId);
            }}
          />
        </h2>
        <h2 className="claim-tile__title">{`${collectionItemUrls.length} Items`}</h2>
        {pendingCollection && <h2 className="claim-tile__title">Pending</h2>}
        {editedCollection && <h2 className="claim-tile__title">Edited</h2>}
      </NavLink>
      <div>
        {claim && (
          <div className="claim-tile__info">
            {isChannel ? (
              <div className="claim-tile__about--channel">
                <SubscribeButton uri={uri} />
              </div>
            ) : (
              <React.Fragment>
                <UriIndicator uri={uri} link hideAnonymous>
                  <ChannelThumbnail thumbnailPreview={channelThumbnail} />
                </UriIndicator>

                <div className="claim-tile__about">
                  <UriIndicator uri={uri} link />
                  <DateTime timeAgo uri={uri} />
                </div>
              </React.Fragment>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export default withRouter(CollectionPreviewTile);
