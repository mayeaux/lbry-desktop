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
      icon = id === 'watchlater' ? ICONS.TIME : ICONS.STACK;
      break;
    case 'published':
      icon = ICONS.STACK;
      break;
    default:
      // 'unpublished'
      icon = ICONS.ANONYMOUS;
      break;
  }

  return (
    <div className={'collection-select__item'}>
      <FormField
        checked={hasClaim}
        disabled={collectionPending}
        icon={icon}
        type="checkbox"
        name={`select-${id}`}
        onChange={handleChange} // edit the collection
        label={
          <span>
            <Icon icon={icon} className={'icon-collection-select'} />
            {`${name}`}
          </span>
        } // the collection name
      />
    </div>
  );
}

export default CollectionSelectItem;
