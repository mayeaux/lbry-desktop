// @flow
import React from 'react';
import CollectionPreviewTile from 'component/collectionPreviewTile';
import ClaimList from 'component/claimList';
import Button from '../button';

type Props = {
  builtinCollections: Array<Collection>,
  publishedCollections: CollectionGroup,
  publishedPlaylists: CollectionGroup,
  unpublishedCollections: CollectionGroup,
  // savedCollections: CollectionGroup,
};

export default function CollectionsListMine(props: Props) {
  const {
    builtinCollections,
    publishedPlaylists,
    unpublishedCollections,
    // savedCollections, these are resolved on startup from sync'd claimIds or urls
  } = props;

  const builtinCollectionsList = (Object.values(builtinCollections || {}): any);
  const unpublishedCollectionsList = (Object.keys(unpublishedCollections || {}): any);

  return (
    <>
      {builtinCollectionsList.map((list: Collection) => {
        const { items: itemUrls } = list;
        if (!itemUrls.length) return null;
        return (
          <>
            <h1>
              <Button button="link" navigate={`/$/collection/${list.id}`} label={list.name} />
            </h1>
            <ClaimList tileLayout key={list.name} uris={itemUrls} collectionId={list.id} />
          </>
        );
      })}

      {unpublishedCollectionsList && unpublishedCollectionsList.length > 0 && (
        <>
          <h1>Unpublished Playlists</h1>
          <div className="claim-grid">
            {unpublishedCollectionsList &&
              unpublishedCollectionsList.map((key) => (
                <CollectionPreviewTile tileLayout collectionId={key} key={key} />
              ))}
          </div>
        </>
      )}

      {Boolean(Object.keys(publishedPlaylists).length) && (
        <>
          <h1>Published Playlists</h1>
          <div className={'claim-grid'}>
            {(Object.keys(publishedPlaylists): any).map((key) => {
              return <CollectionPreviewTile tileLayout collectionId={key} key={key} />;
            })}
          </div>
        </>
      )}
    </>
  );
}
