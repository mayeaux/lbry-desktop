// @flow
import React from 'react';
import Button from 'component/button';
import Card from 'component/common/card';
import { FormField } from 'component/common/form';
import * as ICONS from 'constants/icons';
import CollectionSelectItem from 'component/collectionSelectItem';
import { isNameValid } from 'lbry-redux';
import { INVALID_NAME_ERROR } from 'constants/claim';

type Props = {
  claim: Claim,
  builtin: any,
  published: any,
  unpublished: any,
  addCollection: (string, string) => void, // maybe promise
  closeModal: () => void,
  uri: string,
};

const ClaimCollectionAdd = (props: Props) => {
  const { builtin, published, unpublished, addCollection, claim, closeModal, uri } = props;
  const permanentUrl = claim && claim.permanent_url;

  const [newCollectionName, setNewCollectionName] = React.useState('');
  const [newCollectionPlaylist, setNewCollectionPlaylist] = React.useState(false);
  const [newCollectionNameError, setNewCollectionNameError] = React.useState();

  const isPlayable =
    claim &&
    claim.value &&
    // $FlowFixMe
    claim.value.stream_type &&
    (claim.value.stream_type === 'audio' || claim.value.stream_type === 'video');

  React.useEffect(() => {
    if (isPlayable) {
      setNewCollectionPlaylist(true);
    }
  }, [isPlayable, setNewCollectionPlaylist]);
  function handleNameInput(e) {
    const { value } = e.target;
    setNewCollectionName(value);
    if (!isNameValid(value, 'false')) {
      setNewCollectionNameError(INVALID_NAME_ERROR);
    } else {
      setNewCollectionNameError();
    }
  }

  function handleAddCollection() {
    addCollection(newCollectionName, newCollectionPlaylist ? 'playlist' : 'collection');
    setNewCollectionName('');
  }

  return (
    <Card
      title={__('Add to collection')}
      subtitle={__('Add uri to collection')}
      actions={
        <div className="card__body">
          <fieldset-section>
            {uri && (
              <>
                {/* $FlowFixMe */}
                {Object.values(builtin).map((l) => {
                  const { id } = l;
                  return <CollectionSelectItem collectionId={id} uri={permanentUrl} key={id} category={'builtin'} />;
                })}
                {unpublished &&
                  // $FlowFixMe
                  Object.values(unpublished).map((l) => {
                    const { id } = l;
                    return (
                      <CollectionSelectItem collectionId={id} uri={permanentUrl} key={id} category={'unpublished'} />
                    );
                  })}
                {published &&
                  // $FlowFixMe
                  Object.values(published).map((l) => {
                    const { id } = l;
                    return (
                      <CollectionSelectItem collectionId={id} uri={permanentUrl} key={id} category={'published'} />
                    );
                  })}
              </>
            )}
          </fieldset-section>
          <fieldset-section>
            <FormField
              type="text"
              name="new_collection"
              value={newCollectionName}
              error={newCollectionNameError}
              inputButton={
                <Button
                  button={'secondary'}
                  icon={ICONS.ADD}
                  disabled={!newCollectionName.length}
                  onClick={() => handleAddCollection()}
                />
              }
              onChange={handleNameInput}
              placeholder={__('New Collection')}
            />
            <FormField
              checked={newCollectionPlaylist}
              type="checkbox"
              onClick={() => setNewCollectionPlaylist(!newCollectionPlaylist)}
              name="replace-claims"
              label={__('Playable List')}
            />
          </fieldset-section>
          <div className="card__actions">
            <Button button="secondary" label={__('Done')} onClick={closeModal} />
          </div>
        </div>
      }
    />
  );
};
export default ClaimCollectionAdd;
