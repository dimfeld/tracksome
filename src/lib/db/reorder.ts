import sorter from 'sorters';

export function reorder(items: Record<number, number | string>, itemToMove: number, delta: number) {
  let itemList = Object.entries(items)
    .map(([id, sort]) => ({ id: +id, sort: +sort }))
    .sort(sorter((i) => i.sort));

  let movingIndex = itemList.findIndex((i) => i.id === itemToMove);
  if (movingIndex < 0) {
    return;
  }

  let destinationIndex = movingIndex + delta;

  if (destinationIndex >= 0 && destinationIndex < itemList.length) {
    [itemList[destinationIndex], itemList[movingIndex]] = [
      itemList[movingIndex],
      itemList[destinationIndex],
    ];
    let newSorts = itemList.map((value, i) => ({ trackable_id: value.id, sort: i }));
    return newSorts;
  }
}
