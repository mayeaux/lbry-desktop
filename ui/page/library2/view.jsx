// @flow
import React from 'react';
import Button from 'component/button';
import Page from 'component/page';
import Spinner from 'component/spinner';
import DownloadList from 'page/fileListDownloaded';
import Yrbl from 'component/yrbl';
import { useHistory } from 'react-router';
import ClaimList from 'component/claimList';
import CollectionPreviewTile from 'component/collectionPreviewTile';
import ClaimCollectionAddButton from 'component/claimCollectionAddButton';

// https://github.com/lbryio/lbry-sdk/issues/2964
export const PURCHASES_PAGE_SIZE = 10;

type Props = {
  allDownloadedUrlsCount: number,
  myPurchases: Array<string>,
  fetchingMyPurchases: boolean,
  fetchingFileList: boolean,
  doPurchaseList: (number, number) => void,
  builtinCollections: Array<Collection>,
  publishedCollections: CollectionGroup,
  publishedPlaylists: CollectionGroup,
  unpublishedCollections: CollectionGroup,
  // savedCollections: CollectionGroup,
};

function LibraryPage(props: Props) {
  const {
    allDownloadedUrlsCount,
    myPurchases,
    fetchingMyPurchases,
    fetchingFileList,
    doPurchaseList,
    builtinCollections,
    publishedCollections,
    publishedPlaylists,
    unpublishedCollections,
    // savedCollections, these are resolved on startup from sync'd claimIds or urls
  } = props;
  const { location } = useHistory();
  const urlParams = new URLSearchParams(location.search);
  const page = Number(urlParams.get('page')) || 1;
  const hasDownloads = allDownloadedUrlsCount > 0 || (myPurchases && myPurchases.length > 0);
  const loading = fetchingFileList || fetchingMyPurchases;

  React.useEffect(() => {
    doPurchaseList(page, PURCHASES_PAGE_SIZE);
  }, [doPurchaseList, page]);

  return (
    <Page>
      {loading && !hasDownloads && (
        <div className="main--empty">
          <Spinner delayed />
        </div>
      )}
      {/* $FlowFixMe */}
      {Object.values(builtinCollections).map((list: Collection) => {
        const items = list.items;
        // $FlowFixMe
        const itemurls = items;
        // $FlowFixMe
        if (!itemurls.length) return null;
        return (
          <>
            <h1>{list.name}</h1>
            <ClaimList tileLayout key={list.name} uris={itemurls} collectionId={list.id} />
          </>
        );
        // }
      })}
      <h1>
        Unpublished Collections <ClaimCollectionAddButton link />
      </h1>
      <div className={'claim-grid'}>
        {/* $FlowFixMe */}
        {Object.keys(unpublishedCollections).map((key) => {
          return (
            <>
              <CollectionPreviewTile tileLayout collectionId={key} key={key} />
            </>
          );
          // }
        })}
      </div>
      <h1>Published Collections</h1>
      <div className={'claim-grid'}>
        {/* $FlowFixMe */}
        {Object.keys(publishedCollections).map((key) => {
          // $FlowFixMe
          return (
            <>
              <CollectionPreviewTile tileLayout collectionId={key} key={key} />
            </>
          );
          // }
        })}
      </div>
      <h1>Published Playlists</h1>
      <div className={'claim-grid'}>
        {/* $FlowFixMe */}
        {Object.keys(publishedPlaylists).map((key) => {
          // $FlowFixMe
          return (
            <>
              <CollectionPreviewTile tileLayout collectionId={key} key={key} />
            </>
          );
          // }
        })}
      </div>
      {!loading && !hasDownloads && (
        <div className="main--empty">
          <Yrbl
            title={
              IS_WEB ? __("You haven't purchased anything yet") : __("You haven't downloaded anything from LBRY yet")
            }
            actions={
              <div className="section__actions">
                <Button button="primary" navigate="/" label={__('Explore New Content')} />
              </div>
            }
          />
        </div>
      )}

      {hasDownloads && <DownloadList />}
    </Page>
  );
}

export default LibraryPage;
