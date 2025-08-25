export interface DataRepository<T> {
  getAll(): T[];
}
