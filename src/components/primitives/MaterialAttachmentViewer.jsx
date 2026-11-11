import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, File, FileText, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { fetchAttachmentBlob, formatFileSize } from '../../lib/api';

export function MaterialAttachmentViewer({ attachment }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attachment?.url) {
      setBlobUrl(null);
      setTextPreview(null);
      setError('');
      return;
    }

    let cancelled = false;
    let createdUrl = null;
    setLoading(true);
    setError('');
    setTextPreview(null);

    fetchAttachmentBlob(attachment.url)
      .then(async ({ blob, contentType }) => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);

        if ((contentType || attachment.contentType || '').startsWith('text/')) {
          const text = await blob.text();
          if (!cancelled) setTextPreview(text);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load attached file.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [attachment?.url, attachment?.contentType]);

  if (!attachment) return null;

  const ct = attachment.contentType || '';
  const isImage = ct.startsWith('image/');
  const isPdf = ct === 'application/pdf';
  const isText = ct.startsWith('text/');
  const previewable = isImage || isPdf || isText;
  const IconComp = isImage ? ImageIcon : isPdf || isText ? FileText : File;

  return (
    <div className="mt-4 rounded-2xl border border-border-subtle bg-card-muted/40 p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-accent-muted text-accent flex items-center justify-center shrink-0">
            <IconComp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-text-main truncate">{attachment.name}</p>
            <p className="text-[11px] text-text-muted">
              {formatFileSize(attachment.size)}
              {isImage ? ' • Image' : isPdf ? ' • PDF Document' : isText ? ' • Text / Markdown' : ' • Study Document'}
            </p>
          </div>
        </div>

        {blobUrl && (
          <div className="flex items-center gap-2 shrink-0">
            {previewable && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border-subtle text-xs font-bold text-text-main hover:border-accent hover:text-accent transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </a>
            )}
            <a
              href={blobUrl}
              download={attachment.name || 'study-material'}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-bold shadow-sm hover:opacity-95 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        )}
      </div>

      {loading && (
        <div className="py-8 flex items-center justify-center gap-2 text-xs text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span>Loading file preview...</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && blobUrl && isImage && (
        <div className="rounded-xl overflow-hidden border border-border-subtle bg-card flex items-center justify-center p-2">
          <img
            src={blobUrl}
            alt={attachment.name}
            className="max-h-80 w-auto object-contain rounded-lg"
          />
        </div>
      )}

      {!loading && !error && blobUrl && isPdf && (
        <iframe
          src={blobUrl}
          title={attachment.name}
          className="w-full h-80 rounded-xl border border-border-subtle bg-white"
        />
      )}

      {!loading && !error && isText && textPreview !== null && (
        <pre className="p-3.5 rounded-xl bg-card border border-border-subtle text-xs text-text-main overflow-auto max-h-72 whitespace-pre-wrap font-mono leading-relaxed">
          {textPreview}
        </pre>
      )}

      {!loading && !error && blobUrl && !previewable && (
        <div className="p-4 rounded-xl bg-card border border-border-subtle text-xs text-text-secondary text-center">
          This document format opens in its desktop application (Word / PowerPoint / Excel). Click{' '}
          <span className="font-bold text-text-main">Download</span> above to open & inspect it.
        </div>
      )}
    </div>
  );
}
