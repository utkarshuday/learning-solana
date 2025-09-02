import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { MovieReview } from '../target/types/movie_review';
import { expect } from 'chai';

describe('movie-review', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const user = provider.wallet;

  const program = anchor.workspace.movieReview as Program<MovieReview>;
  const movie = {
    title: 'Inglorious Bastards',
    rating: 5,
    description: 'Beautiful Movie',
  };

  const [moviePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), user.publicKey.toBuffer()],
    program.programId
  );

  it('Movie review added', async () => {
    const tx = await program.methods
      .addMovieReview(movie.title, movie.rating, movie.description)
      .accounts({ user: user.publicKey })
      .signers([user.payer])
      .rpc();

    const account = await program.account.movieReviewAccount.fetch(moviePda);
    expect(account.title).to.equal(movie.title);
    expect(account.rating).to.equal(movie.rating);
    expect(account.description).to.equal(movie.description);
    expect(account.reviewer.toBase58()).to.equal(user.publicKey.toBase58());

    console.log('Your transaction signature', tx);
  });

  it('Movie review updated', async () => {
    const newDescription = 'Wow this is new';
    const newRating = 4;

    const tx = await program.methods
      .updateMovieReview(movie.title, newRating, newDescription)
      .signers([user.payer])
      .rpc();
    const account = await program.account.movieReviewAccount.fetch(moviePda);

    expect(account.title).to.equal(movie.title);
    expect(account.rating).to.equal(newRating);
    expect(account.description).to.equal(newDescription);
    expect(account.reviewer.toBase58()).to.equal(user.publicKey.toBase58());

    console.log('Your transaction signature', tx);
  });

  it('Deletes a movie review', async () => {
    const tx = await program.methods.deleteMovieReview(movie.title).rpc();
    console.log('Your transaction signature', tx);
  });
});
