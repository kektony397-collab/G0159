
import FlexSearch from 'flexsearch';

export const createIndex = () => {
  return new FlexSearch.Document({
    document: {
      id: "id",
      index: ["name", "batch", "hsn", "manufacturer"],
      store: true
    },
    tokenize: "forward",
    resolution: 9
  });
};
