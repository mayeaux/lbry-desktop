// @flow
import * as ICONS from 'constants/icons';
import React, { useState } from 'react';
import Button from 'component/button';
import ClaimList from 'component/claimList';
import Paginate from 'component/common/paginate';
import { PAGE_SIZE } from 'constants/claim';
import Icon from 'component/common/icon';

import { withRouter } from 'react-router';
import classnames from 'classnames';
import Yrbl from 'component/yrbl';
import { PURCHASES_PAGE_SIZE } from 'page/library/view';
import Spinner from 'component/spinner';
import { VIEW_DOWNLOADS, VIEW_PURCHASES } from 'page/library2/view';

type Props = {
  fetchingFileList: boolean,
  downloadedUrls: Array<string>,
  downloadedUrlsCount: ?number,
  history: { replace: (string) => void },
  query: string,
  page: number,
  viewMode: string,
  doPurchaseList: () => void,
  myDownloads: Array<string>,
  myPurchases: Array<string>,
  myPurchasesCount: ?number,
  fetchingMyPurchases: boolean,
};

function FileListDownloaded(props: Props) {
  const {
    history,
    query,
    page,
    viewMode,
    downloadedUrlsCount,
    myPurchasesCount,
    myPurchases,
    myDownloads,
    fetchingFileList,
    fetchingMyPurchases,
  } = props;
  const loading = fetchingFileList || fetchingMyPurchases;

  if (viewMode === VIEW_PURCHASES && myPurchasesCount === 0) {
    return (
      <div className="main--empty">
        <Yrbl
          title={__('No purchases found')}
          subtitle={__('Your purchased files will be saved here.')}
          actions={
            <div className="section__actions">
              <Button button="primary" label={__('Explore')} navigate="/" />
            </div>
          }
        />
      </div>
    );
  }

  if (viewMode === VIEW_DOWNLOADS && downloadedUrlsCount === 0) {
    return (
      <div className="main--empty">
        <Yrbl
          title={IS_WEB ? __('Try out the app!') : __('No downloads found')}
          subtitle={
            IS_WEB
              ? __("Download the app to track files you've viewed and downloaded.")
              : __('Your purchased files will be saved here.')
          }
          actions={
            <div className="section__actions">
              {IS_WEB ? (
                <Button button="primary" label={__('Get The App')} href="https://lbry.com/get" />
              ) : (
                <Button button="primary" label={__('Explore')} navigate="/" />
              )}
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <ClaimList
        renderProperties={() => null}
        empty={
          viewMode === VIEW_PURCHASES && !query ? (
            <div>{__('No purchases found.')}</div>
          ) : (
            __('No results for %query%', { query })
          )
        }
        uris={viewMode === VIEW_PURCHASES ? myPurchases : myDownloads}
        loading={loading}
      />
      {!query && (
        <Paginate
          totalPages={Math.ceil(
            Number(viewMode === VIEW_PURCHASES ? myPurchasesCount : downloadedUrlsCount) /
              Number(viewMode === VIEW_PURCHASES ? PURCHASES_PAGE_SIZE : PAGE_SIZE)
          )}
        />
      )}
    </div>
  );
}

export default withRouter(FileListDownloaded);
