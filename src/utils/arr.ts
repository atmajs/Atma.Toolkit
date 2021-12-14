export function arr_each<T = any> (mix: T[] | T, fn: (x: T, i?: number) => void)  {
    if (Array.isArray(mix)) {
        mix.forEach(fn);
        return;
    }
    fn(mix, 0);
}
