import mongoose, { Document } from 'mongoose';

export class Transform {
  /**
   * Dynamically renames keys in an object or an array of objects while preserving key order.
   *
   * @param data - The input data (single object or array of objects).
   * @param keyPairs - An array of key pairs [[oldKey1, newKey1], [oldKey2, newKey2]].
   * @returns The transformed data with renamed keys and original order preserved.
   */
  public static data<T>(
    data: T | T[],
    keyPairs: [string, string][],
  ): Record<string, any> | Record<string, any>[] {
    const transformItem = (item: any) => {
      const plainItem = item?.toObject ? item.toObject() : item;

      // Create a new object preserving key order
      const transformedItem: Record<string, any> = {};

      Object.keys(plainItem).forEach((key) => {
        // Check if the current key needs to be renamed
        const pair = keyPairs.find(([oldKey]) => oldKey === key);

        if (pair) {
          const [, newKey] = pair;
          transformedItem[newKey] = plainItem[key]; // Use the new key name
        } else {
          transformedItem[key] = plainItem[key]; // Keep the original key
        }
      });

      return transformedItem;
    };

    // Handle arrays and single objects
    return Array.isArray(data)
      ? data.map((item) => transformItem(item))
      : transformItem(data);
  }
}
