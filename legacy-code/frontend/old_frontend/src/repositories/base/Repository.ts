
export abstract class BaseRepository<T, ID> {
  abstract findById(id: ID): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(entity: Partial<T>): Promise<T>;
  abstract update(id: ID, entity: Partial<T>): Promise<T | null>;
  abstract delete(id: ID): Promise<boolean>;
}
