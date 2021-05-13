// @flow
import * as PAGES from 'constants/pages';
import * as MODALS from 'constants/modal_types';
import * as ICONS from 'constants/icons';
import React from 'react';
import Button from 'component/button';
import { useIsMobile } from 'effects/use-screensize';
import ClaimSupportButton from 'component/claimSupportButton';
import FileReactions from 'component/fileReactions';
import { useHistory } from 'react-router';
import { EDIT_PAGE, PAGE_VIEW_QUERY } from 'page/collection/view';
import classnames from 'classnames';
import { ENABLE_FILE_REACTIONS } from 'config';

type Props = {
  uri: string,
  claim: StreamClaim,
  openModal: (id: string, { uri: string, claimIsMine?: boolean, isSupport?: boolean }) => void,
  myChannels: ?Array<ChannelClaim>,
  doToast: ({ message: string }) => void,
  claimIsPending: boolean,
  isMyCollection: boolean,
  collectionId: string,
  showInfo: boolean,
  setShowInfo: (boolean) => void,
};

function CollectionActions(props: Props) {
  const { uri, openModal, claim, claimIsPending, isMyCollection, collectionId, showInfo, setShowInfo } = props;
  const { push } = useHistory();
  const isMobile = useIsMobile();
  const claimId = claim && claim.claim_id;
  // We want to use the short form uri for editing
  // This is what the user is used to seeing, they don't care about the claim id
  // We will select the claim id before they publish
  const webShareable = true; // collections have cost?

  const lhsSection = (
    <>
      {/* Reactions didn't work - maybe only on web? */}
      {ENABLE_FILE_REACTIONS && uri && <FileReactions uri={uri} />}
      <ClaimSupportButton uri={uri} fileAction />
      {/* reposts need testing
              <Button
        button="alt"
        className="button--file-action"
        icon={ICONS.REPOST}
        label={
          claim.meta.reposted > 1 ? __(`%repost_total% Reposts`, { repost_total: claim.meta.reposted }) : __('Repost')
        }
        description={__('Repost')}
        requiresAuth={IS_WEB}
        onClick={handleRepostClick}
      />
         */}

      <Button
        className="button--file-action"
        icon={ICONS.SHARE}
        label={__('Share')}
        title={__('Share')}
        onClick={() => openModal(MODALS.SOCIAL_SHARE, { uri, webShareable })}
      />
    </>
  );

  const rhsSection = (
    <>
      {isMyCollection && (
        <Button
          title={uri ? __('Edit') : __('Publish')}
          label={uri ? __('Edit') : __('Publish')}
          className={classnames('button--file-action')}
          onClick={() => push(`?${PAGE_VIEW_QUERY}=${EDIT_PAGE}`)}
          icon={ICONS.PUBLISH}
          iconSize={18}
          disabled={claimIsPending}
        />
      )}
      {isMyCollection && (
        <Button
          className={classnames('button--file-action')}
          title={__('Delete Collection')}
          onClick={() => openModal(MODALS.COLLECTION_DELETE, { uri, collectionId })}
          icon={ICONS.DELETE}
          iconSize={18}
          description={__('Delete Collection')}
          disabled={claimIsPending}
        />
      )}
      {!isMyCollection && (
        <Button
          title={__('Report content')}
          className="button--file-action"
          icon={ICONS.REPORT}
          navigate={`/$/${PAGES.REPORT_CONTENT}?claimId=${claimId}`}
        />
      )}
      {
        <Button
          title={__('Info')}
          className="button--file-action"
          icon={ICONS.MORE}
          onClick={() => setShowInfo(!showInfo)}
        />
      }
    </>
  );

  if (isMobile) {
    return (
      <div className="media__actions">
        {lhsSection}
        {rhsSection}
      </div>
    );
  } else {
    return (
      <div className="media__actions">
        <div className="section__actions section__actions--no-margin">
          {lhsSection}
          {rhsSection}
        </div>
      </div>
    );
  }
}

export default CollectionActions;
