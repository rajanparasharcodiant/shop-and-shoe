import {useSearchParams} from '@remix-run/react';

export function ProductFilter({filters = []}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const priceMin = searchParams.get('filter.v.price.gte');
  const priceMax = searchParams.get('filter.v.price.lte');

  const toggleFilter = (filterId, valueInput) => {
    const currentValues = searchParams.getAll(filterId);
    const isActive = currentValues.includes(valueInput);

    const newParams = new URLSearchParams(searchParams);

    if (isActive) {
      const newValues = currentValues.filter(val => val !== valueInput);
      newParams.delete(filterId);
      newValues.forEach(val => newParams.append(filterId, val));
    } else {
      newParams.append(filterId, valueInput);
    }

    setSearchParams(newParams);
  };

  const removeFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (key === 'filter.v.price.gte' || key === 'filter.v.price.lte') {
      newParams.delete('filter.v.price.gte');
      newParams.delete('filter.v.price.lte');
    } else {
      const remaining = searchParams.getAll(key).filter(v => v !== value);
      newParams.delete(key);
      remaining.forEach(v => newParams.append(key, v));
    }

    setSearchParams(newParams);
  };

  return (
    <div>
      {/* Active Filters Display */}
      <div className="active-filters">
      {(() => {
          const entries = Array.from(searchParams.entries());
          const rendered = new Set();

          const validFilterKeys = new Set();

          // Build valid keys based on filters
          filters.forEach((filter) => {
            if (filter.id.startsWith('meta:')) {
              const [namespace, key] = filter.id.split(':')[1].split('/');
              validFilterKeys.add(`filter.p.m.${namespace}.${key}`);
            } else {
              const id = filter.id.startsWith('filter.') ? filter.id : `filter.v.option.${filter.id}`;
              validFilterKeys.add(id);
            }
          });

          return entries.map(([key, value]) => {
            if (
              (key === 'filter.v.price.gte' || key === 'filter.v.price.lte') &&
              !rendered.has('price') &&
              (priceMin || priceMax)
            ) {
              rendered.add('price');
              return (
                <div key="price-filter" className="filter-tag">
                  <span>Price: {priceMin} - {priceMax}</span>
                  <button onClick={() => removeFilter('filter.v.price.gte', '')}>✖</button>
                </div>
              );
            }

            // Only show filters that are valid
            if (validFilterKeys.has(key)) {
              return (
                <div key={key + value} className="filter-tag">
                  <span>{decodeURIComponent(value)}</span>
                  <button onClick={() => removeFilter(key, value)}>✖</button>
                </div>
              );
            }

            return null;
          });
        })()}

      </div>

      {/* Render All Filters */}
      {filters.map((filter) => {
        if (filter.label === 'Price') return null;

        // Determine filter key
        let filterKey;
        if (filter.id.startsWith('meta:')) {
          const metaParts = filter.id.split(':')[1].split('/');
          const namespace = metaParts[0];
          const key = metaParts[1];
          filterKey = `filter.m.${namespace}.${key}`;
        } else {
          filterKey = filter.id.startsWith('filter.') ? filter.id : `filter.v.option.${filter.id}`;
        }

        return (
          <div key={filter.id}>
            <h4>{filter.label}</h4>
            {filter.values.map(value => (
              <label key={value.id}>
                <input
                  type="checkbox"
                  checked={searchParams.getAll(filterKey).includes(value.label)}
                  onChange={() => toggleFilter(filterKey, value.label)}
                />
                {value.label} ({value.count})
              </label>
            ))}
          </div>
        );
      })}

      {/* Price Filter */}
      <div>
        <h4>Price</h4>
        <div className="price-filter">
          <div className="price-filter-range">
            <div className="field">
              <label className="field__label" htmlFor="Filter-Price-GTE">From</label>
              <input
                type="number"
                id="Filter-Price-GTE"
                defaultValue={priceMin ?? ''}
                min="0"
                placeholder='0'
                onBlur={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('filter.v.price.gte', e.target.value);
                  setSearchParams(newParams);
                }}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="Filter-Price-LTE">To</label>
              <input
                type="number"
                id="Filter-Price-LTE"
                placeholder='40'
                defaultValue={priceMax ?? ''}
                min={priceMin}
                onBlur={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('filter.v.price.lte', e.target.value);
                  setSearchParams(newParams);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}