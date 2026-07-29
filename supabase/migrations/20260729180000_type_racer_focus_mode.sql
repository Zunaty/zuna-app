-- Allow Type Racer word-focus timed modes on best-score rows.
alter table public.type_racer_best_scores
  drop constraint if exists type_racer_best_scores_mode_check;

alter table public.type_racer_best_scores
  add constraint type_racer_best_scores_mode_check
  check (mode in ('words-30', 'words-60', 'focus-30', 'focus-60', 'sentence', 'paragraph'));
