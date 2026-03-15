import React from 'react';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M6 6l12 12" strokeLinecap="round" />
    <path d="M18 6L6 18" strokeLinecap="round" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 10v6" strokeLinecap="round" />
    <circle cx="12" cy="7.25" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const TechniqueGuideSheet = ({
  title,
  pattern,
  description,
  benefits,
  instructions,
  labels,
  onClose
}) => {
  const currentColors = useThemeColors();

  return (
    <div
      className="sheet-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="technique-guide-title"
      onClick={onClose}
    >
      <div
        className="sheet-modal__panel glass-panel"
        style={{
          color: currentColors.text
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-modal__header">
          <div>
            <div className="sheet-modal__eyebrow">
              <InfoIcon />
              <span>{labels.guide}</span>
            </div>
            <h2 id="technique-guide-title" className="sheet-modal__title">
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="sheet-modal__close"
            onClick={onClose}
            aria-label={labels.close}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="sheet-modal__body">
          {pattern ? (
            <div className="sheet-modal__pattern">{pattern}</div>
          ) : null}

          {description ? (
            <p className="sheet-modal__description">{description}</p>
          ) : null}

          {benefits ? (
            <section className="sheet-modal__section">
              <h3 className="sheet-modal__section-title">{labels.usefulFor}</h3>
              <p className="sheet-modal__copy">{benefits}</p>
            </section>
          ) : null}

          {instructions?.length ? (
            <section className="sheet-modal__section">
              <h3 className="sheet-modal__section-title">{labels.howTo}</h3>
              <ol className="sheet-modal__steps">
                {instructions.map((instruction, index) => (
                  <li key={`${index}-${instruction}`} className="sheet-modal__step">
                    {instruction}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TechniqueGuideSheet;
