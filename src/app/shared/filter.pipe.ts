import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], filter: string): any[] {
        if (!items || (!filter && filter !== '')) {
            return items;
        }

        filter = filter.toLowerCase();

        return items.filter(
            (item) =>
                item.name.toLowerCase().includes(filter) ||
                item.email.toLowerCase().includes(filter)
        );
    }
}
