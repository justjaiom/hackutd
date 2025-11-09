-- Best-effort undo for filling project.description and project.metadata.website
-- that were copied from the related company.
--
-- IMPORTANT: This reverts ONLY when the current project value exactly matches
-- the company's value. If some projects legitimately use the same values,
-- they'll be cleared as well. Review with the SELECTs below before running.

-- Preview: how many project descriptions match their company's description?
-- SELECT COUNT(*)
-- FROM projects p
-- JOIN companies c ON c.id = p.company_id
-- WHERE p.description IS NOT NULL AND p.description = c.description;

-- Preview: how many project websites match their company's website?
-- SELECT COUNT(*)
-- FROM projects p
-- JOIN companies c ON c.id = p.company_id
-- WHERE p.metadata->>'website' IS NOT NULL
--   AND p.metadata->>'website' = c.settings->>'website';

-- Revert project.description to NULL when it equals the company description
UPDATE projects p
SET description = NULL
FROM companies c
WHERE p.company_id = c.id
  AND p.description IS NOT NULL
  AND p.description = c.description;

-- Remove metadata.website when it equals the company website
UPDATE projects p
SET metadata = (COALESCE(p.metadata, '{}'::jsonb) - 'website')
FROM companies c
WHERE p.company_id = c.id
  AND p.metadata->>'website' IS NOT NULL
  AND p.metadata->>'website' = c.settings->>'website';

-- Optional: preview remaining matches after undo (should be zero ideally)
-- SELECT COUNT(*)
-- FROM projects p
-- JOIN companies c ON c.id = p.company_id
-- WHERE p.description IS NOT NULL AND p.description = c.description;
--
-- SELECT COUNT(*)
-- FROM projects p
-- JOIN companies c ON c.id = p.company_id
-- WHERE p.metadata->>'website' IS NOT NULL
--   AND p.metadata->>'website' = c.settings->>'website';
