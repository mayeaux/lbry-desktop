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
  addCollection: (string, string) => void,
  closeModal: () => void,
  uri: string,
};

const ClaimCollectionAdd = (props: Props) => {
  const { builtin, published, unpublished, addCollection, claim, closeModal, uri } = props;
  const permanentUrl = claim && claim.permanent_url;
  const isChannel = claim && claim.value_type === 'channel';

  const [newCollectionName, setNewCollectionName] = React.useState('');
  const [newCollectionNameError, setNewCollectionNameError] = React.useState();

  // TODO: when other collection types added, filter list in context
  // const isPlayable =
  //   claim &&
  //   claim.value &&
  //   // $FlowFixMe
  //   claim.value.stream_type &&
  //   (claim.value.stream_type === 'audio' || claim.value.stream_type === 'video');

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
    addCollection(newCollectionName, isChannel ? 'collection' : 'playlist');
    setNewCollectionName('');
  }

  return (
    <Card
      title={__('Add to collection')}
      actions={
        <div className="card__body">
          {uri && (
            <fieldset-section>
              <div className={'card__body-scrollable'}>
                {(Object.values(builtin): any)
                  // $FlowFixMe
                  .filter((list) => (isChannel ? list.type === 'collection' : list.type === 'playlist'))
                  .map((l) => {
                    const { id } = l;
                    return <CollectionSelectItem collectionId={id} uri={permanentUrl} key={id} category={'builtin'} />;
                  })}
                {unpublished &&
                  (Object.values(unpublished): any)
                    // $FlowFixMe
                    .filter((list) => (isChannel ? list.type === 'collection' : list.type === 'playlist'))
                    .map((l) => {
                      const { id } = l;
                      return (
                        <CollectionSelectItem collectionId={id} uri={permanentUrl} key={id} category={'unpublished'} />
                      );
                    })}
                {published &&
                  (Object.values(published): any).map((l) => {
                    // $FlowFixMe
                    const { id } = l;
                    return (
                      <CollectionSelectItem collectionId={id} uri={permanentUrl} key={id} category={'published'} />
                    );
                  })}
              </div>
            </fieldset-section>
          )}
          <fieldset-section>
            <FormField
              type="text"
              name="new_collection"
              value={newCollectionName}
              error={newCollectionNameError}
              label={'name'}
              inputButton={
                <Button
                  button={'secondary'}
                  icon={ICONS.ADD}
                  disabled={!newCollectionName.length}
                  onClick={() => handleAddCollection()}
                />
              }
              onChange={handleNameInput}
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
