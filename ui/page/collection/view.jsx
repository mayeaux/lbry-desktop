// @flow
import * as ICONS from 'constants/icons';
import { COLLECTIONS_CONSTS as COLS } from 'lbry-redux';
import React from 'react';
import ClaimList from 'component/claimList';
import Page from 'component/page';
import Button from 'component/button';
import * as PAGES from 'constants/pages';
import ShareButton from 'component/shareButton';
import { useHistory } from 'react-router-dom';
import CollectionEdit from 'component/collectionEdit';
import Card from 'component/common/card';
import FileActions from 'component/fileActions';
import classnames from 'classnames';
import ClaimAuthor from 'component/claimAuthor';
import FileDescription from 'component/fileDescription';

export const PAGE_VIEW_QUERY = 'view';
export const PUBLISH_PAGE = 'publish';
export const EDIT_PAGE = 'edit';
export const ADVANCED_EDIT_PAGE = 'advanced';

type Props = {
  collectionId: string,
  uri: string,
  claim: Claim,
  title: string,
  thumbnail: string,
  collection: Collection,
  collectionUrls: Array<string>,

  isResolvingCollection: boolean,
  isMyClaim: boolean,
  isMyCollection: boolean,
  claimIsPending: boolean,

  deleteCollection: (string) => void,
  editCollection: (string, CollectionUpdateParams) => void,
  fetchCollectionItems: (string, () => void) => void,
  resolveUris: (string) => void,
  user: ?User,
};

export default function CollectionPage(props: Props) {
  const {
    collectionId,
    uri,
    claim,
    // title,
    // thumbnail,
    collection,
    collectionUrls,

    isResolvingCollection,
    isMyClaim,
    isMyCollection,
    claimIsPending,

    fetchCollectionItems,
    deleteCollection,
  } = props;

  const {
    push,
    replace,
    location: { search },
  } = useHistory();

  const [didTryResolve, setDidTryResolve] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  // const isClaim = Boolean(claim); do I need this for anything related to unpublished collection ids?

  const { name, totalItems } = collection || {};

  const urlParams = new URLSearchParams(search);
  const editing = urlParams.get(PAGE_VIEW_QUERY) === EDIT_PAGE;

  const isMine = isMyClaim || isMyCollection; // isMyCollection
  const builtin = COLS.BUILTIN_LISTS.includes(collectionId);
  const urlsReady =
    (collectionUrls && totalItems === undefined) || // ready if totalItems is missing
    (collectionUrls && totalItems && totalItems === collectionUrls.length); // ready if collectionUrls length = resolved totalItems
  const shouldFetch = !claim && !collection;

  React.useEffect(() => {
    if (collectionId && !urlsReady && !didTryResolve && shouldFetch) {
      fetchCollectionItems(collectionId, () => setDidTryResolve(true)); // implicitly does claimSearch if necessary
    }
  }, [collectionId, urlsReady, didTryResolve, shouldFetch, setDidTryResolve, fetchCollectionItems]);

  function handleDeleteCollection() {
    // just do a delete modal confirm
    deleteCollection(collectionId);
    replace(`/$/${PAGES.LIBRARY}/`);
  }
  const buttons = (
    <div>
      {uri && <ShareButton uri={uri} />}
      {isMine && !builtin && (
        <>
          {claimIsPending ? (
            <span>{__('Your changes will be live in a few minutes')}</span>
          ) : (
            <>
              <Button
                button="alt"
                title={uri ? __('Edit') : __('Publish')}
                label={uri ? __('Edit') : __('Publish')}
                onClick={() => push(`?${PAGE_VIEW_QUERY}=${EDIT_PAGE}`)}
                icon={ICONS.PUBLISH}
                iconSize={18}
                disabled={claimIsPending}
              />
              <Button
                button="alt"
                title={__('Delete')}
                onClick={handleDeleteCollection}
                icon={ICONS.DELETE}
                iconSize={18}
                disabled={claimIsPending}
              />
              <Button
                className={classnames('button-toggle', {
                  'button-toggle--active': showInfo,
                })}
                label={__('Info')}
                onClick={() => setShowInfo(!showInfo)}
              />
            </>
          )}
        </>
      )}
      {!isMine && (
        <>
          {claimIsPending ? (
            <span>{__('Your changes will be live in a few minutes')}</span>
          ) : (
            <>
              <Button
                button="alt"
                title={__('Save')}
                onClick={() => push(`?${PAGE_VIEW_QUERY}=${EDIT_PAGE}`)}
                icon={ICONS.DOWNLOAD}
                iconSize={18}
                disabled={claimIsPending}
              />
              <Button
                button="alt"
                title={__('Copy')}
                onClick={handleDeleteCollection}
                icon={ICONS.COPY}
                iconSize={18}
                disabled={claimIsPending}
              />
            </>
          )}
        </>
      )}
    </div>
  );

  const info = (
    <Card
      title={collection && collection.name}
      body={<FileActions uri={uri} />}
      actions={
        showInfo && (
          <div className="section">
            <ClaimAuthor uri={uri} />
            <FileDescription uri={uri} />
          </div>
        )
      }
    />
  );

  if (!collection && (isResolvingCollection || !didTryResolve)) {
    return (
      <Page>
        <h2 className="main--empty empty">{__('Loading...')}</h2>
      </Page>
    );
  }

  if (!collection && !isResolvingCollection && didTryResolve) {
    return (
      <Page>
        <h2 className="main--empty empty">{__('Nothing here')}</h2>
      </Page>
    );
  }

  if (editing) {
    return (
      <Page
        noFooter
        noSideNavigation={editing}
        backout={{
          title: __('Editing %collection%', { collection: name }),
          simpleTitle: __('Editing'),
        }}
      >
        <CollectionEdit
          uri={uri}
          collectionId={collectionId}
          onDone={(claimId) => {
            replace(`/$/${PAGES.COLLECTION}/${claimId}`);
          }}
        />
      </Page>
    );
  }
  // some kind of header here?
  // pass up, down, delete controls through claim list
  return (
    <Page>
      <div className={classnames('section card-stack')}>
        {buttons}
        {info}
        <ClaimList uris={collectionUrls} collectionId={collectionId} />
      </div>
    </Page>
  );
}
