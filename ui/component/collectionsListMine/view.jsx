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
  const publishedList = (Object.keys(publishedPlaylists || {}): any);

  return (
    <>
      {builtinCollectionsList.map((list: Collection) => {
        const { items: itemUrls } = list;
        if (!itemUrls.length) return null;
        return (
          <div className="claim-grid__wrapper" key={list.name}>
            <h1 className="claim-grid__header">
              <Button
                className="claim-grid__title"
                button="link"
                navigate={`/$/collection/${list.id}`}
                label={list.name}
              />
            </h1>
            <ClaimList tileLayout key={list.name} uris={itemUrls} collectionId={list.id} />
          </div>
        );
      })}
      <div className="claim-grid__wrapper">
        <h1 className="claim-grid__header">
          <span className="claim-grid__title">{__('Playlists')}</span>
        </h1>

        <>
          <div className="claim-grid">
            {unpublishedCollectionsList &&
              unpublishedCollectionsList.length > 0 &&
              unpublishedCollectionsList.map((key) => (
                <CollectionPreviewTile tileLayout collectionId={key} key={key} />
              ))}
            {publishedList &&
              publishedList.length > 0 &&
              publishedList.map((key) => {
                return <CollectionPreviewTile tileLayout collectionId={key} key={key} />;
              })}
          </div>
        </>
      </div>
    </>
  );
}
