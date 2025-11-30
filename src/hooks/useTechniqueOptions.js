import { useMemo } from 'react';
import { useLocalization } from '../contexts/LocalizationContext.jsx';
import { techniqueRegistry } from '../techniques/TechniqueRegistry.js';

export function useTechniqueOptions() {
  const { t } = useLocalization();

  const options = useMemo(() => {
    return techniqueRegistry.getTechniqueMetadata().map((technique) => ({
      ...technique,
      name: t(`techniques.${technique.id}.name`) || technique.name,
      description: t(`techniques.${technique.id}.description`) || technique.description,
      benefits: t(`techniques.${technique.id}.benefits`) || technique.benefits,
      value: technique.id,
      label: t(`techniques.${technique.id}.name`) || technique.name
    }));
  }, [t]);

  return options;
}

export function useTechniqueOptionById(techniqueId) {
  const options = useTechniqueOptions();

  return useMemo(() => options.find((option) => option.id === techniqueId), [options, techniqueId]);
}
