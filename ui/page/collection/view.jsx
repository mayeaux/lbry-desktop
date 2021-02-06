// @flow
import * as ICONS from 'constants/icons';
import React from 'react';
import ClaimList from 'component/claimList';
import Page from 'component/page';
import Button from 'component/button';
import * as PAGES from 'constants/pages';
import ShareButton from 'component/shareButton';
import ChannelThumbnail from 'component/fileThumbnail';
import { useHistory } from 'react-router-dom';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'component/common/tabs';
import CollectionEdit from 'component/collectionEdit';
import Card from 'component/common/card';
import { FormField } from 'component/common/form-components/form-field';
import { Form } from 'component/common/form-components/form';
import ErrorText from 'component/common/error-text';

export const PAGE_VIEW_QUERY = 'view';
export const PUBLISH_PAGE = 'publish';
export const EDIT_PAGE = 'edit';
export const ADVANCED_EDIT_PAGE = 'advanced';
const ABOUT_PAGE = `about`;

const TEXT_AREA_CLAIMIDS_MAX_CHARS = 22000; // approximately 500 claimIds including quotes, commas, and newline

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
    title,
    thumbnail,
    collection,
    collectionUrls,

    isResolvingCollection,
    isMyClaim,
    isMyCollection,
    claimIsPending,

    fetchCollectionItems,
    deleteCollection,
    editCollection,
    user,
  } = props;

  const {
    push,
    replace,
    location: { search },
  } = useHistory();

  const [claimsReplace, setClaimsReplace] = React.useState(false);
  const [collectionClaimIds, setCollectionClaimIds] = React.useState('');
  const [claimIdError, setClaimIdError] = React.useState('');
  const [didTryResolve, setDidTryResolve] = React.useState(false);
  // const isClaim = Boolean(claim); do I need this for anything related to unpublished collection ids?

  const { name, totalItems } = collection || {};

  const urlParams = new URLSearchParams(search);
  const currentView = urlParams.get(PAGE_VIEW_QUERY) || undefined;
  const editing = urlParams.get(PAGE_VIEW_QUERY) === EDIT_PAGE;

  let tabIndex;
  switch (currentView) {
    case ABOUT_PAGE:
      tabIndex = 1;
      break;
    case ADVANCED_EDIT_PAGE:
      tabIndex = 2;
      break;
    default:
      tabIndex = 0;
  }

  const isMine = isMyClaim || isMyCollection; // isMyCollection
  const advancedEdit = (user && user.experimental_ui) || false;
  const urlsReady =
    (collectionUrls && totalItems === undefined) || // ready if totalItems is missing
    (collectionUrls && totalItems && totalItems === collectionUrls.length); // ready if collectionUrls length = resolved totalItems
  const shouldFetch = !claim && !collection;

  React.useEffect(() => {
    if (collectionId && !urlsReady && !didTryResolve && shouldFetch) {
      fetchCollectionItems(collectionId, () => setDidTryResolve(true)); // implicitly does claimSearch if necessary
    }
  }, [collectionId, urlsReady, didTryResolve, shouldFetch, setDidTryResolve, fetchCollectionItems]);

  const sanitizeClaimIds = (claimIds) => claimIds.trim().replace(/['"\n\s]|,$/g, '');

  const handleClaimsChange = (event) => {
    const isValidClaimIdList = (colClaimIds) => {
      const sanitizedList = sanitizeClaimIds(colClaimIds).split(',');
      return (
        sanitizedList &&
        sanitizedList.some((colClaimId) => {
          return colClaimId.length !== 40 || !colClaimId.match(/^[0-9a-f]+$/);
        })
      );
    };
    const claimIds = event.target.value;
    let error = isValidClaimIdList(claimIds);
    if (error) {
      setClaimIdError(__('Invalid list of claim ids'));
    } else {
      setClaimIdError('');
    }
    setCollectionClaimIds(claimIds);
  };

  function handleReplaceChange() {
    setClaimsReplace(!claimsReplace);
  }

  function handleSubmit() {
    const params = {};
    params.claimIds = sanitizeClaimIds(collectionClaimIds).split(',');
    if (claimsReplace) params.replace = true;
    const success = editCollection(collectionId, params);
    if (success) setCollectionClaimIds('');
  }

  function handleTabChange(newTabIndex) {
    let search = '?';

    if (newTabIndex === 0) {
      search = '';
    } else if (newTabIndex === 1) {
      search += `${PAGE_VIEW_QUERY}=${ABOUT_PAGE}`;
    } else if (newTabIndex === 2) {
      search += `${PAGE_VIEW_QUERY}=${ADVANCED_EDIT_PAGE}`;
    }
    // NO, go to the page.
    // `/$/${PAGES.COLLECTION}/${id}/`
    replace(`/$/${PAGES.COLLECTION}/${collectionId}/${search}`);
  }

  function handleDeleteCollection() {
    deleteCollection(collectionId);
    replace(`/$/${PAGES.LIBRARY}/`);
  }
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

  const about = (
    <div>
      <h1>About</h1>
    </div>
  );
  // some kind of header here?
  // pass up, down, delete controls through claim list
  return (
    <Page>
      <header className="channel-cover">
        {thumbnail && <ChannelThumbnail className="channel__thumbnail--channel-page" thumbnail={thumbnail} allowGifs />}

        <div className="channel__quick-actions">
          <ShareButton uri={uri} />
          {isMine && (
            <>
              {claimIsPending ? (
                <span>{__('Your changes will be live in a few minutes')}</span>
              ) : (
                <>
                  <Button
                    button="alt"
                    title={__('Edit')}
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
        <div className="channel__primary-info">
          <h1 className="channel__title">{`${title || name} - ${collectionUrls.length} items`}</h1>
          <div className="channel__meta" />
        </div>
        <div className="channel-cover__gradient" />
      </header>
      <Tabs onChange={handleTabChange} index={tabIndex}>
        <TabList className="tabs__list--channel-page">
          <Tab disabled={editing}>{__('Items')}</Tab>
          <Tab>{editing ? __('Editing Your Channel') : __('About --[tab title in Channel Page]--')}</Tab>
          {advancedEdit && <Tab>{__('Advanced Item Edit')}</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <ClaimList
              header={<h1>Header</h1>}
              uris={collectionUrls}
              // loading={isSearching}
              collectionId={collectionId}
            />
          </TabPanel>
          <TabPanel>{about}</TabPanel>
          {advancedEdit && (
            <TabPanel>
              <Card
                title={__('Collection Claim Ids')}
                subtitle={__('Add or Replace Collection Claim Ids')}
                actions={
                  <Form onSubmit={handleSubmit} className="section">
                    <FormField
                      type="textarea"
                      rows="500"
                      textAreaMaxLength={TEXT_AREA_CLAIMIDS_MAX_CHARS}
                      name="collection-claims-to-add"
                      stretch
                      label={__('Comma-delimited claimIds')}
                      helper={claimIdError && <ErrorText>{claimIdError}</ErrorText>}
                      value={collectionClaimIds}
                      onChange={handleClaimsChange}
                    />
                    <FormField
                      checked={claimsReplace}
                      type="checkbox"
                      onChange={handleReplaceChange}
                      name="replace-claims"
                      label={__('Replace Claims')}
                    />
                    <div className="section__actions">
                      <Button button="primary" onClick={handleSubmit} disabled={claimIdError}>
                        {claimsReplace ? __('Replace Claims') : __('Add Claims')}
                      </Button>
                    </div>
                  </Form>
                }
              />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Page>
  );
}
