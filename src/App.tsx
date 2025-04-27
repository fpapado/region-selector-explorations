import { useId, useMemo, useState } from "react";
import countries from "./countries.json" with { type: "json" };
import "./App.css";

const APP_LANGUAGES = ["en", "en-US", "en-GB", "fi", "sv", "sv-FI", "el"];
const DEFAULT_LANG = "en";
const NONE_REGION_VALUE = "none";

// In reality, you'd use some internationalisation setup that caches the
// formatter creation, since it's expensive. Here's a mini version of that, for
// fun and no profit.
const displayNamesCache = new Map<string, Intl.DisplayNames>();

function getDisplayNamesFormatter(
  locales: Intl.LocalesArgument,
  opts: Intl.DisplayNamesOptions,
): Intl.DisplayNames {
  const locale = Intl.DisplayNames.supportedLocalesOf(locales);

  const cacheKey = locale + JSON.stringify(opts);

  const cachedFormatter = displayNamesCache.get(cacheKey);
  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DisplayNames(locale, opts);
  displayNamesCache.set(cacheKey, formatter);

  return formatter;
}

function App() {
  // In reality, you might persist this to a cookie, but let's keep it simple
  // for this demo
  const [language, setLanguage] = useState(DEFAULT_LANG);
  const [region, setRegion] = useState<string | undefined>(undefined);

  const idPrefix = useId();

  const languageId = idPrefix + "lang";
  const regionId = idPrefix + "region";
  const regionDescriptionId = regionId + "-desc";

  const regionFormatter = getDisplayNamesFormatter(language, {
    type: "region",
  });

  const locale = useMemo(() => {
    return new Intl.Locale(
      region !== undefined ? `${language}-u-rg-${region}zzzz` : language,
    );
  }, [language, region]);

  return (
    <main>
      <form>
        <h1>Settings</h1>

        <fieldset>
          <legend>
            <h2>Country and region</h2>
          </legend>

          <div>
            <label htmlFor={languageId}>Language</label>
            <select
              className="language"
              name="language"
              id={languageId}
              onChange={(ev) => {
                setLanguage(
                  APP_LANGUAGES.includes(ev.currentTarget.value)
                    ? ev.currentTarget.value
                    : DEFAULT_LANG,
                );
              }}
            >
              {APP_LANGUAGES.map((lang) => (
                <option value={lang} key={lang}>
                  {getDisplayNamesFormatter(lang, {
                    type: "language",
                    languageDisplay: "standard",
                  }).of(lang)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={regionId}>Display Region</label>
            <p id={regionDescriptionId}>
              This setting is used to localise how currencies and dates are
              displayed. It does not affect other parts of the site.
            </p>
            <select
              name="region"
              id={regionId}
              defaultValue={NONE_REGION_VALUE}
              className="region"
              onChange={(ev) => {
                const value = ev.currentTarget.value;
                if (value === NONE_REGION_VALUE) {
                  setRegion(undefined);
                  return;
                }
                setRegion(ev.currentTarget.value);
              }}
            >
              <option value={NONE_REGION_VALUE}>None</option>
              {countries.map((country) => (
                <option value={country} key={country}>
                  {regionFormatter.of(country)}
                </option>
              ))}
            </select>
          </div>

          <h3>Example</h3>
          <dl>
            <dt>Locale</dt>
            <dd>
              <output>{locale.toString()}</output>
            </dd>
            <dt>Currency</dt>
            <dd>
              <output>
                {new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: "EUR",
                }).format(1234.56)}
              </output>
            </dd>
            <dt>Date (short)</dt>
            <dd>
              <output>
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "short",
                }).format(new Date(2025, 1, 14))}
              </output>
            </dd>
          </dl>
        </fieldset>
      </form>
    </main>
  );
}

export default App;
