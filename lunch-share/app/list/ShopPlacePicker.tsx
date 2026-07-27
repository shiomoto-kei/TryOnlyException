'use client';

import {
  APIProvider,
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react';

export type PlaceSelection = {
  name: string;
  address: string;
  position: google.maps.LatLngLiteral;
};

type ShopPlacePickerProps = {
  apiKey: string;
  query: string;
  position: google.maps.LatLngLiteral | null;
  onQueryChange: (value: string) => void;
  onPlaceSelect: (place: PlaceSelection) => void;
  onError: (message: string) => void;
};

type PlaceSearchInputProps = Omit<
  ShopPlacePickerProps,
  'apiKey' | 'position'
>;

const DEFAULT_CENTER = {
  lat: 35.681236,
  lng: 139.767125,
};

function PlaceSearchInput({
  query,
  onQueryChange,
  onPlaceSelect,
  onError,
}: PlaceSearchInputProps) {
  const places = useMapsLibrary('places');
  const [suggestions, setSuggestions] = useState<
    google.maps.places.PlacePrediction[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const input = query.trim();
    const requestId = ++requestIdRef.current;

    if (!places || input.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        sessionTokenRef.current ??= new places.AutocompleteSessionToken();

        const { suggestions: results } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            includedRegionCodes: ['jp'],
            language: 'ja',
            region: 'jp',
            sessionToken: sessionTokenRef.current,
          });

        if (requestId !== requestIdRef.current) return;

        setSuggestions(
          results
            .map((suggestion) => suggestion.placePrediction)
            .filter(
              (
                prediction
              ): prediction is google.maps.places.PlacePrediction =>
                prediction !== null
            )
            .slice(0, 5)
        );
      } catch {
        if (requestId !== requestIdRef.current) return;

        setSuggestions([]);
        onError(
          'お店の検索候補を取得できません。店名と住所は手入力できます。'
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [onError, places, query]);

  const selectPrediction = async (
    prediction: google.maps.places.PlacePrediction
  ) => {
    setSuggestions([]);
    setIsLoading(true);

    try {
      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });

      if (!place.location) {
        throw new Error('location_not_found');
      }

      onPlaceSelect({
        name:
          place.displayName ??
          prediction.mainText?.text ??
          prediction.text.text,
        address: place.formattedAddress ?? '',
        position: {
          lat: place.location.lat(),
          lng: place.location.lng(),
        },
      });
      sessionTokenRef.current = null;
      setIsFocused(false);
    } catch {
      onError(
        '選択したお店の住所を取得できませんでした。住所を手入力してください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <div style={pickerStyles.searchField}>
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        placeholder={
          places
            ? '店名を入力して候補から選択'
            : '店名を入力（検索機能を読み込み中）'
        }
        role="combobox"
        aria-label="行きたいお店を検索"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls="shop-place-suggestions"
        autoComplete="off"
        style={pickerStyles.searchInput}
      />

      {isLoading && <span style={pickerStyles.loading}>検索中</span>}

      {showSuggestions && (
        <ul
          id="shop-place-suggestions"
          role="listbox"
          style={pickerStyles.suggestionList}
        >
          {suggestions.map((prediction) => (
            <li
              key={prediction.placeId}
              role="option"
              aria-selected="false"
            >
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectPrediction(prediction)}
                style={pickerStyles.suggestionButton}
              >
                <span style={pickerStyles.suggestionName}>
                  {prediction.mainText?.text ?? prediction.text.text}
                </span>
                {prediction.secondaryText?.text && (
                  <span style={pickerStyles.suggestionAddress}>
                    {prediction.secondaryText.text}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MapController({
  position,
}: {
  position: google.maps.LatLngLiteral | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !position) return;

    map.panTo(position);
    map.setZoom(17);
  }, [map, position]);

  return null;
}

export default function ShopPlacePicker({
  apiKey,
  query,
  position,
  onQueryChange,
  onPlaceSelect,
  onError,
}: ShopPlacePickerProps) {
  if (!apiKey) {
    return (
      <div style={pickerStyles.fallback}>
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="店名を入力"
          aria-label="行きたいお店の名前"
          style={pickerStyles.searchInput}
        />
        <p style={pickerStyles.help}>
          Google Maps APIキーが設定されると検索候補を利用できます。
        </p>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      language="ja"
      region="JP"
      onError={() =>
        onError(
          'Google Mapsを読み込めません。店名と住所は手入力できます。'
        )
      }
    >
      <PlaceSearchInput
        query={query}
        onQueryChange={onQueryChange}
        onPlaceSelect={onPlaceSelect}
        onError={onError}
      />

      <Map
        style={pickerStyles.map}
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={position ? 17 : 5}
        gestureHandling="greedy"
        disableDefaultUI
        reuseMaps
      >
        <MapController position={position} />
        {position && <Marker position={position} />}
      </Map>
    </APIProvider>
  );
}

const pickerStyles: { [key: string]: React.CSSProperties } = {
  searchField: {
    position: 'relative',
    width: '100%',
  },
  searchInput: {
    width: '100%',
    minWidth: 0,
    height: 36,
    padding: '7px 68px 7px 10px',
    border: '1px solid #aaa',
    borderRadius: 4,
    background: '#fff',
    color: '#333',
    fontSize: 12,
    fontWeight: 700,
    outlineColor: '#F5B042',
    boxSizing: 'border-box',
  },
  loading: {
    position: 'absolute',
    top: 10,
    right: 10,
    color: '#777',
    fontSize: 10,
  },
  suggestionList: {
    position: 'absolute',
    top: 39,
    left: 0,
    right: 0,
    zIndex: 20,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    border: '1px solid #bbb',
    borderRadius: 4,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.16)',
    overflow: 'hidden',
  },
  suggestionButton: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: 2,
    padding: '9px 10px',
    border: 'none',
    borderBottom: '1px solid #eee',
    background: '#fff',
    color: '#222',
    textAlign: 'left',
    cursor: 'pointer',
  },
  suggestionName: {
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.4,
  },
  suggestionAddress: {
    color: '#777',
    fontSize: 10,
    lineHeight: 1.4,
  },
  map: {
    width: '100%',
    height: 220,
    marginTop: 10,
    border: '1px solid #ddd',
    borderRadius: 6,
  },
  fallback: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  help: {
    margin: 0,
    color: '#777',
    fontSize: 10,
    lineHeight: 1.4,
  },
};
