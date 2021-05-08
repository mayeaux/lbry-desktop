// @flow
import * as ICONS from 'constants/icons';
import React from 'react';
import classnames from 'classnames';
import Button from 'component/button';
import Page from 'component/page';
import Spinner from 'component/spinner';
import DownloadList from 'page/fileListDownloaded';
import { useHistory } from 'react-router';
import CollectionsListMine from 'component/collectionsListMine';
import usePersistedState from 'effects/use-persisted-state';
import { Form, FormField } from 'component/common/form';
import Icon from 'component/common/icon';

// https://github.com/lbryio/lbry-sdk/issues/2964
export const PURCHASES_PAGE_SIZE = 10;
export const VIEW_DOWNLOADS = 'view_download';
export const VIEW_PURCHASES = 'view_purchases';
export const VIEW_COLLECTIONS = 'view_collections';

type Props = {
  allDownloadedUrlsCount: number,
  myPurchases: Array<string>,
  fetchingMyPurchases: boolean,
  fetchingFileList: boolean,
  doPurchaseList: (number, number) => void,
};

function LibraryPage(props: Props) {
  const { allDownloadedUrlsCount, myPurchases, fetchingMyPurchases, fetchingFileList, doPurchaseList } = props;
  const [viewMode, setViewMode] = usePersistedState('library-view-mode', VIEW_PURCHASES);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { replace, location } = useHistory();
  const urlParams = new URLSearchParams(location.search);
  const page = Number(urlParams.get('page')) || 1;
  const query = urlParams.get('query') || '';
  const hasDownloads = allDownloadedUrlsCount > 0 || (myPurchases && myPurchases.length > 0);
  const loading = fetchingFileList || fetchingMyPurchases;

  React.useEffect(() => {
    doPurchaseList(page, PURCHASES_PAGE_SIZE);
  }, [doPurchaseList, page]);

  function handleInputChange(e) {
    const { value } = e.target;
    if (value !== searchQuery) {
      setSearchQuery(value);
      replace(`?query=${value}&page=1`);
    }
  }

  return (
    <Page>
      {loading && !hasDownloads && (
        <div className="main--empty">
          <Spinner delayed />
        </div>
      )}

      {!loading && (
        <>
          <div className="section__header--actions">
            <div className="section__actions--inline">
              <Button
                icon={ICONS.LIBRARY}
                button="alt"
                label={__('Downloads')}
                className={classnames(`button-toggle`, {
                  'button-toggle--active': viewMode === VIEW_DOWNLOADS,
                })}
                onClick={() => setViewMode(VIEW_DOWNLOADS)}
              />
              <Button
                icon={ICONS.PURCHASED}
                button="alt"
                label={__('Purchases')}
                className={classnames(`button-toggle`, {
                  'button-toggle--active': viewMode === VIEW_PURCHASES,
                })}
                onClick={() => setViewMode(VIEW_PURCHASES)}
              />
              <Button
                icon={ICONS.STACK}
                button="alt"
                label={__('Collections')}
                className={classnames(`button-toggle`, {
                  'button-toggle--active': viewMode === VIEW_COLLECTIONS,
                })}
                onClick={() => setViewMode(VIEW_COLLECTIONS)}
              />
              {loading && <Spinner type="small" />}
            </div>

            {viewMode !== VIEW_COLLECTIONS && (
              <Form onSubmit={() => {}} className="wunderbar--inline">
                <Icon icon={ICONS.SEARCH} />
                <FormField
                  className="wunderbar__input--inline"
                  onChange={handleInputChange}
                  value={query}
                  type="text"
                  name="query"
                  placeholder={__('Search')}
                />
              </Form>
            )}
          </div>

          {viewMode === VIEW_COLLECTIONS ? (
            <CollectionsListMine />
          ) : (
            <DownloadList query={query} page={page} viewMode={viewMode} />
          )}
        </>
      )}
    </Page>
  );
}

export default LibraryPage;
