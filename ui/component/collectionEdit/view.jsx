// @flow
import * as MODALS from 'constants/modal_types';
import * as ICONS from 'constants/icons';
import React from 'react';
import classnames from 'classnames';
import { FormField } from 'component/common/form';
import Button from 'component/button';
import TagsSearch from 'component/tagsSearch';
import { FF_MAX_CHARS_IN_DESCRIPTION } from 'constants/form-field';
import ErrorText from 'component/common/error-text';
import CollectionThumbnail from 'component/channelThumbnail';
import { isNameValid } from 'lbry-redux';
import ClaimAbandonButton from 'component/claimAbandonButton';
import { useHistory } from 'react-router-dom';
import { MINIMUM_PUBLISH_BID, INVALID_NAME_ERROR, ESTIMATED_FEE } from 'constants/claim';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'component/common/tabs';
import Card from 'component/common/card';
import * as PAGES from 'constants/pages';
// import analytics from 'analytics';
import LbcSymbol from 'component/common/lbc-symbol';
import SUPPORTED_LANGUAGES from 'constants/supported_languages';
import ChannelSelector from 'component/channelSelector';
import { DOMAIN } from 'config';
import ClaimList from 'component/claimList';

const LANG_NONE = 'none';

const MAX_TAG_SELECT = 5;

type Props = {
  claim: CollectionClaim,
  title: string,
  amount: number,
  thumbnailUrl: string,
  location: { search: string },
  description: string,
  balance: number,
  tags: Array<string>,
  locations: Array<string>,
  languages: Array<string>,
  publishCollectionUpdate: (CollectionUpdateParams) => Promise<any>,
  updatingCollection: boolean,
  updateError: string,
  publishCollection: (CollectionPublishParams, string) => Promise<any>,
  createError: string,
  creatingCollection: boolean,
  clearCollectionErrors: () => void,
  onDone: (string) => void,
  openModal: (
    id: string,
    { onUpdate: (string) => void, assetName: string, helpText: string, currentValue: string, title: string }
  ) => void,
  uri: string,
  disabled: boolean,
  activeChannelClaim: ?ChannelClaim,
  incognito: boolean,
  collectionId: string,
  collection: Collection,
  collectionClaimIds: Array<string>,
  collectionUrls: Array<string>,
};

function CollectionForm(props: Props) {
  const {
    uri, // collection uri
    claim,
    amount,
    title,
    description,
    thumbnailUrl,
    tags,
    locations,
    languages = [],
    onDone,
    publishCollectionUpdate,
    updateError,
    updatingCollection,
    publishCollection,
    creatingCollection,
    createError,
    // clearCollectionErrors,
    openModal,
    disabled,
    activeChannelClaim,
    incognito,
    collectionId,
    collection,
    collectionUrls,
    collectionClaimIds,
  } = props;
  const activeChannelName = activeChannelClaim && activeChannelClaim.name;
  let prefix = IS_WEB ? `${DOMAIN}/` : 'lbry://';
  if (activeChannelName && !incognito) {
    prefix += `${activeChannelName}/`;
  }
  const activeChannelId = activeChannelClaim && activeChannelClaim.claim_id;
  const collectionName = (claim && claim.name) || (collection && collection.name);

  const [nameError, setNameError] = React.useState(undefined);
  const [bidError, setBidError] = React.useState('');
  const [params, setParams]: [any, (any) => void] = React.useState(getCollectionParams());
  const name = params.name;
  const isNewCollection = !uri;
  const { replace } = useHistory();
  const languageParam = params.languages;
  const primaryLanguage = Array.isArray(languageParam) && languageParam.length && languageParam[0];
  const secondaryLanguage = Array.isArray(languageParam) && languageParam.length >= 2 && languageParam[1];

  function getCollectionParams() {
    // fill this in with sdk data
    const collectionParams: {
      thumbnail_url?: string,
      name: string,
      description?: string,
      title?: string,
      bid: string,
      languages?: ?Array<string>,
      locations?: ?Array<string>,
      tags?: ?Array<{ name: string }>,
      claim_id?: string,
      channel_id?: string,
      claims: ?Array<string>,
    } = {
      thumbnail_url: thumbnailUrl,
      description,
      title,
      name: collectionName,
      bid: String(amount || 0.001),
      languages: languages || [],
      locations: locations || [],
      tags: tags
        ? tags.map((tag) => {
            return { name: tag };
          })
        : [],
      claims: collectionClaimIds,
    };

    if (activeChannelId) {
      collectionParams['channel_id'] = activeChannelId;
    }

    return collectionParams;
  }
  function handleBidChange(bid: number) {
    const { balance, amount } = props;
    const totalAvailableBidAmount = (parseFloat(amount) || 0.0) + (parseFloat(balance) || 0.0);

    setParams({ ...params, bid: bid });

    if (bid <= 0.0 || isNaN(bid)) {
      setBidError(__('Deposit cannot be 0'));
    } else if (totalAvailableBidAmount < bid) {
      setBidError(
        __('Deposit cannot be higher than your available balance: %balance%', { balance: totalAvailableBidAmount })
      );
    } else if (totalAvailableBidAmount - bid < ESTIMATED_FEE) {
      setBidError(__('Please decrease your deposit to account for transaction fees'));
    } else if (bid < MINIMUM_PUBLISH_BID) {
      setBidError(__('Your deposit must be higher'));
    } else {
      setBidError('');
    }
  }

  function handleLanguageChange(index, code) {
    let langs = [...languageParam];
    if (index === 0) {
      if (code === LANG_NONE) {
        // clear all
        langs = [];
      } else {
        langs[0] = code;
      }
    } else {
      if (code === LANG_NONE || code === langs[0]) {
        langs.splice(1, 1);
      } else {
        langs[index] = code;
      }
    }
    setParams({ ...params, languages: langs });
  }

  function handleThumbnailChange(thumbnailUrl: string) {
    setParams({ ...params, thumbnail_url: thumbnailUrl });
  }

  function handleSubmit() {
    if (uri) {
      // fix this - claimid? uri? collectionId?
      publishCollectionUpdate(params).then((pendingClaim) => {
        if (pendingClaim) {
          const claimId = pendingClaim.claim_id;
          onDone(claimId);
        }
      });
    } else {
      publishCollection(params, collectionId).then((pendingClaim) => {
        if (pendingClaim) {
          const claimId = pendingClaim.claim_id;
          // analytics.apiLogPublish(success);
          onDone(claimId);
        }
      });
    }
  }

  React.useEffect(() => {
    let nameError;
    if (!name && name !== undefined) {
      nameError = __('A name is required for your url');
    } else if (!isNameValid(name, false)) {
      nameError = INVALID_NAME_ERROR;
    }

    setNameError(nameError);
  }, [name]);

  React.useEffect(() => {
    if (activeChannelId) {
      setParams({ ...params, channel_id: activeChannelId });
    }
  }, [activeChannelId]);
  //
  // React.useEffect(() => {
  //   clearCollectionErrors();
  // }, [clearCollectionErrors]);

  return (
    <>
      <div className={classnames('main--contained', { 'card--disabled': disabled })}>
        <header className="channel-cover">
          <div className="channel__primary-info">
            <div className="channel__edit-thumb">
              <Button
                button="alt"
                title={__('Edit')}
                onClick={() =>
                  openModal(MODALS.IMAGE_UPLOAD, {
                    onUpdate: (v) => handleThumbnailChange(v),
                    title: __('Edit Thumbnail Image'),
                    helpText: __('(1:1)'),
                    assetName: __('Thumbnail'),
                    currentValue: params.thumbnailUrl,
                  })
                }
                icon={ICONS.CAMERA}
                iconSize={18}
              />
            </div>

            <h1 className="channel__title">{params.title || (params.name && params.name) || collectionName}</h1>
            <h1 className="channel__title">{nameError && nameError}</h1>
            <CollectionThumbnail uri={uri} thumbnailPreview={params.thumbnailUrl} allowGifs showDelayedMessage />
          </div>
          <div className="channel-cover__gradient" />
        </header>

        <Tabs>
          <TabList className="tabs__list--channel-page">
            <Tab>{__('General')}</Tab>
            <Tab>{__('Credit Details')}</Tab>
            <Tab>{__('Tags')}</Tab>
            <Tab>{__('Other')}</Tab>
            <Tab>{__('Items')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Card
                body={
                  <>
                    <fieldset-group className="fieldset-group--smushed fieldset-group--disabled-prefix">
                      <fieldset-section>
                        <label htmlFor="channel_name">{__('Channel')}</label>
                        <ChannelSelector />
                      </fieldset-section>
                    </fieldset-group>
                    <fieldset-group class="fieldset-group--smushed fieldset-group--disabled-prefix">
                      <fieldset-section>
                        <label htmlFor="channel_name">{__('Name')}</label>
                        <div className="form-field__prefix">{prefix}</div>
                      </fieldset-section>

                      <FormField
                        autoFocus={isNewCollection}
                        type="text"
                        name="channel_name"
                        placeholder={__('MyAwesomeCollection')}
                        value={params.name || collectionName}
                        error={nameError}
                        disabled={!isNewCollection}
                        onChange={(e) => setParams({ ...params, name: e.target.value })}
                      />
                    </fieldset-group>
                    {!isNewCollection && (
                      <span className="form-field__help">{__('This field cannot be changed.')}</span>
                    )}

                    <FormField
                      type="text"
                      name="channel_title2"
                      label={__('Title')}
                      placeholder={__('My Awesome Collection')}
                      value={params.title}
                      onChange={(e) => setParams({ ...params, title: e.target.value })}
                    />
                    <FormField
                      type="markdown"
                      name="content_description2"
                      label={__('Description')}
                      placeholder={__('Description of your content')}
                      value={params.description}
                      onChange={(text) => setParams({ ...params, description: text })}
                      textAreaMaxLength={FF_MAX_CHARS_IN_DESCRIPTION}
                    />
                  </>
                }
              />
            </TabPanel>
            <TabPanel>
              <Card
                body={
                  <FormField
                    className="form-field--price-amount"
                    type="number"
                    name="content_bid2"
                    step="any"
                    label={<LbcSymbol postfix={__('Deposit')} size={14} />}
                    value={params.amount}
                    error={bidError}
                    min="0.0"
                    disabled={false}
                    onChange={(event) => handleBidChange(parseFloat(event.target.value))}
                    placeholder={0.1}
                    helper={__('Increasing your deposit can help your channel be discovered more easily.')}
                  />
                }
              />
            </TabPanel>
            <TabPanel>
              <Card
                body={
                  <TagsSearch
                    suggestMature
                    disableAutoFocus
                    limitSelect={MAX_TAG_SELECT}
                    tagsPassedIn={params.tags || []}
                    label={__('Selected Tags')}
                    onRemove={(clickedTag) => {
                      const newTags = params.tags.slice().filter((tag) => tag.name !== clickedTag.name);
                      setParams({ ...params, tags: newTags });
                    }}
                    onSelect={(newTags) => {
                      newTags.forEach((newTag) => {
                        if (!params.tags.map((savedTag) => savedTag.name).includes(newTag.name)) {
                          setParams({ ...params, tags: [...params.tags, newTag] });
                        } else {
                          // If it already exists and the user types it in, remove it
                          setParams({ ...params, tags: params.tags.filter((tag) => tag.name !== newTag.name) });
                        }
                      });
                    }}
                  />
                }
              />
            </TabPanel>
            <TabPanel>
              <Card
                body={
                  <>
                    <FormField
                      name="language_select"
                      type="select"
                      label={__('Primary Language')}
                      onChange={(event) => handleLanguageChange(0, event.target.value)}
                      value={primaryLanguage}
                      helper={__('Your main content language')}
                    >
                      <option key={'pri-langNone'} value={LANG_NONE}>
                        {__('None selected')}
                      </option>
                      {Object.keys(SUPPORTED_LANGUAGES).map((language) => (
                        <option key={language} value={language}>
                          {SUPPORTED_LANGUAGES[language]}
                        </option>
                      ))}
                    </FormField>
                    <FormField
                      name="language_select2"
                      type="select"
                      label={__('Secondary Language')}
                      onChange={(event) => handleLanguageChange(1, event.target.value)}
                      value={secondaryLanguage}
                      disabled={!languageParam[0]}
                      helper={__('Your other content language')}
                    >
                      <option key={'sec-langNone'} value={LANG_NONE}>
                        {__('None selected')}
                      </option>
                      {Object.keys(SUPPORTED_LANGUAGES)
                        .filter((lang) => lang !== languageParam[0])
                        .map((language) => (
                          <option key={language} value={language}>
                            {SUPPORTED_LANGUAGES[language]}
                          </option>
                        ))}
                    </FormField>
                  </>
                }
              />
            </TabPanel>
            <TabPanel>
              <ClaimList
                uris={collectionUrls}
                // loading={isSearching}
                collectionId={collectionId}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Card
          className="card--after-tabs"
          actions={
            <>
              <div className="section__actions">
                <Button
                  button="primary"
                  disabled={creatingCollection || updatingCollection || nameError || bidError}
                  label={creatingCollection || updatingCollection ? __('Submitting') : __('Submit')}
                  onClick={handleSubmit}
                />
                <Button button="link" label={__('Cancel')} onClick={onDone} />
              </div>
              {updateError || createError ? (
                <ErrorText>{updateError || createError}</ErrorText>
              ) : (
                <p className="help">
                  {__('After submitting, it will take a few minutes for your changes to be live for everyone.')}
                </p>
              )}
              {!isNewCollection && (
                <div className="section__actions">
                  <ClaimAbandonButton uri={uri} abandonActionCallback={() => replace(`/$/${PAGES.CHANNELS}`)} />
                </div>
              )}
            </>
          }
        />
      </div>
    </>
  );
}

export default CollectionForm;
