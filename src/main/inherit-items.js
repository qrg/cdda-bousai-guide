'use strict';

export function findById(id, items) {
  return items.find(v => v.id === id);
}

const deleteInheritanceKeys = (item) => {
  ['relative', 'extend', 'proportional', 'delete'].forEach(key => delete item[key]);
  return item;
};

const inheritRelative = (base, sub) => {
  const result = {};
  Object.keys(sub.relative).forEach(key => {
    const baseValue = base[key] || 0;
    result[key] = baseValue + sub.relative[key];
  });
  return result;
};

const inheritProportional = (base, sub) => {
  const result = {};
  Object.keys(sub.proportional).forEach(key => {
    const baseValue = base[key] || 0;
    const ratio = sub.proportional[key] * 100;
    result[key] = Math.trunc(baseValue * ratio / 100);
  });
  return result;
};

const inheritExtend = (base, sub) => {
  const result = {};
  Object.keys(sub.extend).forEach(key => {
    const baseValues = base[key] || [];
    const subValues = sub.extend[key] || [];
    result[key] = [...new Set([...baseValues, ...subValues])];
  });
  return result;
};

const inheritDelete = (base, sub) => {
  const result = {};
  Object.keys(sub.delete).forEach(key => {
    const values = base[key] || [];
    const exclusions = sub.delete[key] || [];
    result[key] = values.filter(v => !exclusions.includes(v));
  });
  return result;
};

export function inheritItems(base, sub, items) {
  if (!base) {
    return deleteInheritanceKeys(sub);
  }

  if (base.hasOwnProperty('copy-from')) {
    // inheritItems recursively
    const origin = findById(base['copy-from'], items);
    base = inheritItems(origin, base, items);
  }

  let result = {...base, ...sub};

  if (sub.hasOwnProperty('relative')) {
    result = {...result, ...inheritRelative(base, sub)};
  }
  if (sub.hasOwnProperty('proportional')) {
    result = {...result, ...inheritProportional(base, sub)};
  }
  if (sub.hasOwnProperty('extend')) {
    result = {...result, ...inheritExtend(base, sub)};
  }
  if (sub.hasOwnProperty('delete')) {
    result = {...result, ...inheritDelete(result, sub)};
  }

  deleteInheritanceKeys(result);
  return result;
}

export function buildInheritedItems(item, index, items) {
  if (!item.hasOwnProperty('copy-from')) {
    return item;
  }
  const baseItem = findById(item['copy-from'], items);
  return inheritItems(baseItem, item, items);
}
