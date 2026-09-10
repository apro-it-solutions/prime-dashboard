import { useState } from 'react'
import { format } from 'date-fns'
import { Mail, MailOpen, Trash2, Eye, Loader2 } from 'lucide-react'
import {
  useContactMessages,
  useContactMessage,
  useMarkContactRead,
  useDeleteContact,
} from '@/hooks/use-contact'
import { type ContactMessage, type ListQuery } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SearchInput } from '@/components/search-input'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataError, DataLoading, EmptyRow } from '@/features/shared/data-states'

const PAGE_SIZE = 10
const READ_ALL = 'all'

/** Column count, kept in step with the header row below. */
const COL_SPAN = 9

const EMPTY = '—'

/**
 * What the enquiry is about.
 *
 * `projectType` is the field the form actually collects. Submissions taken
 * before it had a column of its own only carry `subject` ("Warehouse — Acme
 * Corp"), so that is the fallback rather than showing those rows as blank.
 */
const summaryOf = (msg: ContactMessage): string =>
  msg.projectType?.trim() || msg.subject?.trim() || '(no subject)'

/** One labelled line in the detail view. */
function DetailRow({
  label,
  value,
  href,
}: {
  label: string
  value?: string
  href?: string
}) {
  return (
    <div className='grid grid-cols-3 gap-3 sm:grid-cols-4'>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='col-span-2 text-sm break-words sm:col-span-3'>
        {value ? (
          href ? (
            <a className='underline underline-offset-2' href={href}>
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className='text-muted-foreground'>{EMPTY}</span>
        )}
      </dd>
    </div>
  )
}

export function Contact() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [readFilter, setReadFilter] = useState<string>(READ_ALL)

  const params: ListQuery = {
    page,
    limit: PAGE_SIZE,
    sort: '-createdAt',
    ...(search ? { search } : {}),
    ...(readFilter !== READ_ALL
      ? { isRead: readFilter as 'true' | 'false' }
      : {}),
  }

  const { data, isLoading, isError, refetch } = useContactMessages(params)
  const markRead = useMarkContactRead()
  const deleteMutation = useDeleteContact()

  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<ContactMessage | null>(null)

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const onReadFilterChange = (value: string) => {
    setReadFilter(value)
    setPage(1)
  }

  // Fetching a single message marks it read server-side.
  const { data: viewing, isLoading: isViewLoading } = useContactMessage(
    viewingId ?? '',
    Boolean(viewingId)
  )

  const messages = data?.items ?? []
  const unread = (data?.meta?.unread as number | undefined) ?? 0

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Contact Inbox</h1>
            <p className='text-muted-foreground'>
              {unread > 0
                ? `${unread} unread message${unread === 1 ? '' : 's'}`
                : 'Messages from your website contact form.'}
            </p>
          </div>
        </div>

        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-center'>
          <SearchInput onChange={onSearch} placeholder='Search messages…' />
          <Select value={readFilter} onValueChange={onReadFilterChange}>
            <SelectTrigger className='w-full sm:w-40'>
              <SelectValue placeholder='All messages' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={READ_ALL}>All messages</SelectItem>
              <SelectItem value='false'>Unread</SelectItem>
              <SelectItem value='true'>Read</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'></TableHead>
                <TableHead className='min-w-32'>From</TableHead>
                <TableHead className='min-w-36'>Subject / Project Type</TableHead>
                <TableHead className='min-w-48'>Message</TableHead>
                <TableHead className='min-w-44'>Email</TableHead>
                <TableHead className='hidden min-w-32 lg:table-cell'>
                  Phone
                </TableHead>
                <TableHead className='hidden min-w-32 lg:table-cell'>
                  Company
                </TableHead>
                <TableHead className='min-w-36'>Received</TableHead>
                <TableHead className='w-32 text-end'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <DataLoading colSpan={COL_SPAN} />
              ) : isError ? (
                <DataError colSpan={COL_SPAN} onRetry={() => refetch()} />
              ) : messages.length === 0 ? (
                <EmptyRow colSpan={COL_SPAN} label='Your inbox is empty.' />
              ) : (
                messages.map((msg) => (
                  <TableRow
                    key={msg._id}
                    className={msg.isRead ? '' : 'font-medium'}
                  >
                    <TableCell>
                      {msg.isRead ? (
                        <MailOpen className='size-4 text-muted-foreground' />
                      ) : (
                        <Mail className='size-4 text-primary' />
                      )}
                    </TableCell>
                    <TableCell>{msg.name}</TableCell>
                    <TableCell className='max-w-52 truncate'>
                      {summaryOf(msg)}
                    </TableCell>
                    <TableCell
                      className='max-w-xs truncate font-normal text-muted-foreground'
                      title={msg.message}
                    >
                      {msg.message}
                    </TableCell>
                    <TableCell className='max-w-56 truncate text-muted-foreground'>
                      {msg.email}
                    </TableCell>
                    <TableCell className='hidden text-muted-foreground lg:table-cell'>
                      {msg.phone || EMPTY}
                    </TableCell>
                    <TableCell className='hidden max-w-40 truncate text-muted-foreground lg:table-cell'>
                      {msg.company || EMPTY}
                    </TableCell>
                    <TableCell className='whitespace-nowrap text-muted-foreground'>
                      {format(new Date(msg.createdAt), 'PPp')}
                    </TableCell>
                    <TableCell className='text-end'>
                      <div className='flex justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          title='View'
                          onClick={() => setViewingId(msg._id)}
                        >
                          <Eye className='size-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          title={msg.isRead ? 'Mark unread' : 'Mark read'}
                          onClick={() =>
                            markRead.mutate({ id: msg._id, isRead: !msg.isRead })
                          }
                        >
                          {msg.isRead ? (
                            <Mail className='size-4' />
                          ) : (
                            <MailOpen className='size-4' />
                          )}
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          title='Delete'
                          onClick={() => setDeleting(msg)}
                        >
                          <Trash2 className='size-4 text-destructive' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ListPagination meta={data?.meta} page={page} onPageChange={setPage} />
      </Main>

      {/* View message */}
      <Dialog
        open={Boolean(viewingId)}
        onOpenChange={(open) => !open && setViewingId(null)}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {viewing ? summaryOf(viewing) : 'Message'}
            </DialogTitle>
            <DialogDescription>
              {viewing
                ? `Submitted through the website contact form on ${format(
                    new Date(viewing.createdAt),
                    'PPPp'
                  )}.`
                : 'Loading message…'}
            </DialogDescription>
          </DialogHeader>
          {isViewLoading ? (
            <div className='flex h-24 items-center justify-center'>
              <Loader2 className='size-5 animate-spin text-muted-foreground' />
            </div>
          ) : viewing ? (
            /* Every field the form collects, in the order it is filled in.
               Long messages live here rather than in the table, so a wall of
               text never stretches the inbox. */
            <div className='space-y-4'>
              <dl className='space-y-2.5'>
                <DetailRow label='Full name' value={viewing.name} />
                <DetailRow label='Company' value={viewing.company} />
                <DetailRow
                  label='Email'
                  value={viewing.email}
                  href={`mailto:${viewing.email}`}
                />
                <DetailRow
                  label='Phone'
                  value={viewing.phone}
                  href={viewing.phone ? `tel:${viewing.phone}` : undefined}
                />
                <DetailRow label='Project type' value={viewing.projectType} />
                {/* Only worth its own line when it is not the project type and
                    company repeated back — which is all it holds on submissions
                    taken before those had columns of their own. */}
                {viewing.subject &&
                  viewing.subject !==
                    [viewing.projectType, viewing.company]
                      .filter(Boolean)
                      .join(' — ') && (
                    <DetailRow label='Subject' value={viewing.subject} />
                  )}
                <DetailRow
                  label='Received'
                  value={format(new Date(viewing.createdAt), 'PPPp')}
                />
              </dl>

              <div className='space-y-1.5'>
                <p className='text-xs text-muted-foreground'>
                  Message / requirements
                </p>
                <p className='whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm'>
                  {viewing.message}
                </p>
              </div>

              <div>
                <Badge variant={viewing.isRead ? 'secondary' : 'default'}>
                  {viewing.isRead ? 'Read' : 'Unread'}
                </Badge>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            {viewing && (
              <Button
                variant='outline'
                onClick={() =>
                  markRead.mutate({ id: viewing._id, isRead: !viewing.isRead })
                }
              >
                Mark as {viewing.isRead ? 'unread' : 'read'}
              </Button>
            )}
            <Button onClick={() => setViewingId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title='Delete message?'
        desc={`This will permanently delete the message from ${deleting?.name}.`}
        destructive
        confirmText='Delete'
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (!deleting) return
          deleteMutation.mutate(deleting._id, {
            onSuccess: () => setDeleting(null),
          })
        }}
      />
    </>
  )
}
