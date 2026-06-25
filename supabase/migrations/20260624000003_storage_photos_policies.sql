-- Storage: RLS policies for the 'photos' bucket
-- Bucket was created via API (public: true, max 10MB, images only)

CREATE POLICY "photos_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "photos_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "photos_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "photos_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'photos');
