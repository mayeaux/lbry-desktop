// @flow
import * as ICONS from 'constants/icons';
import React from 'react';
import { FormField } from 'component/common/form';
import Icon from 'component/common/icon';

type Props = {
  collection: Collection,
  hasClaim: boolean,
  category: string,
  edited: boolean,
  editCollection: (string, CollectionUpdateParams) => void,
  claim: Claim,
  collectionPending: boolean,
};

function CollectionSelectItem(props: Props) {
  const { collection, hasClaim, category, editCollection, claim, collectionPending } = props;
  const { name, id } = collection;
  const handleChange = (e) => {
    editCollection(id, { claims: [claim], remove: hasClaim });
  };

  let icon;
  switch (category) {
    case 'builtin':
      icon = ICONS.HOME;
      break;
    case 'published':
      icon = ICONS.PUBLISH;
      break;
    default:
      // 'unpublished'
      icon = ICONS.ANONYMOUS;
      break;
  }

  return (
    <div style={{ display: 'flex' }}>
      <Icon icon={icon} />
      <FormField
        checked={hasClaim}
        disabled={collectionPending}
        type="checkbox"
        name={`select-${id}`}
        onChange={handleChange} // edit the collection
        label={name} // the collection name
      />
    </div>
  );
}

export default CollectionSelectItem;
