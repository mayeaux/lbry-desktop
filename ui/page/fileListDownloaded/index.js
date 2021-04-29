import { connect } from 'react-redux';
import {
  makeSelectSearchDownloadUrlsForPage,
  selectDownloadUrlsCount,
  selectIsFetchingFileList,
  makeSelectMyPurchasesForPage,
  selectIsFetchingMyPurchases,
  selectMyPurchasesCount,
} from 'lbry-redux';
import FileListDownloaded from './view';
import { withRouter } from 'react-router';

const select = (state, props) => {
  return {
    downloadedUrlsCount: selectDownloadUrlsCount(state),
    myPurchasesCount: selectMyPurchasesCount(state),
    myPurchases: makeSelectMyPurchasesForPage(props.query, props.page)(state),
    myDownloads: makeSelectSearchDownloadUrlsForPage(props.query, props.page)(state),
    fetchingFileList: selectIsFetchingFileList(state),
    fetchingMyPurchases: selectIsFetchingMyPurchases(state),
  };
};

export default connect(select)(FileListDownloaded);
