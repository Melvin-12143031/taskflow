
const Footer = () => {
    return (
        <footer className="mt-6 px-6">
            <div className="mx-auto max-w-6xl border-t border-slate-800 py-5">
                <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} TaskFlow. All rights reserved.
                    </p>

                    <p className="text-sm text-slate-500">
                        Stay organized. Get things done.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
