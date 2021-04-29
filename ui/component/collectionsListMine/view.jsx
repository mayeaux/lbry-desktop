import React from 'react';
import CollectionPreviewTile from 'component/collectionPreviewTile';
import ClaimList from 'component/claimList';
import ClaimCollectionAddButton from 'component/claimCollectionAddButton';

type Props = {
  builtinCollections: Array<Collection>,
  publishedCollections: CollectionGroup,
  publishedPlaylists: CollectionGroup,
  unpublishedCollections: CollectionGroup,
  // savedCollections: CollectionGroup,
};

export default function CollectionsListMine(props) {
  const {
    builtinCollections,
    publishedCollections,
    publishedPlaylists,
    unpublishedCollections,
    // savedCollections, these are resolved on startup from sync'd claimIds or urls
  } = props;

  const builtinCollectionsList = Object.values(builtinCollections);
  const unpublishedCollectionsList = Object.keys(unpublishedCollections);

  return (
    <>
      {unpublishedCollectionsList.length > 0 && (
        <div className="claim-grid">
          {unpublishedCollectionsList.map((key) => {
            return <CollectionPreviewTile tileLayout collectionId={key} key={key} />;
          })}
        </div>
      )}

      {builtinCollectionsList.map((list: Collection) => {
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
      })}

      <h1>Published Collections</h1>
      <div className={'claim-grid'}>
        {/* $FlowFixMe */}
        {Object.keys(publishedCollections).map((key) => {
          // $FlowFixMe
          return <CollectionPreviewTile tileLayout collectionId={key} key={key} />;
        })}
      </div>
      <h1>Published Playlists</h1>
      <div className={'claim-grid'}>
        {/* $FlowFixMe */}
        {Object.keys(publishedPlaylists).map((key) => {
          return <CollectionPreviewTile tileLayout collectionId={key} key={key} />;
        })}
      </div>
    </>
  );
}
