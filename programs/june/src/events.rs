#[macro_export]
macro_rules! add_liquidity_emit {
  ($e:expr) => {
    msg!("liquidity is added");
    emit!($e);
  };
}

#[macro_export]
macro_rules! sol_to_spl_emit {
  ($e:expr) => {
    msg!("swapped SOL to JUNE");
    emit!($e);
  };
}

#[macro_export]
macro_rules! spl_to_sol_emit {
  ($e:expr) => {
    msg!("swapped JUNE to SOL");
    emit!($e);
  };
}

#[macro_export]
macro_rules! set_paused_emit {
  ($e:expr) => {
    msg!("pool is paused");
    emit!($e);
  };
}

#[macro_export]
macro_rules! set_swap_rate_emit {
  ($e:expr) => {
    msg!("swap rate updated");
    emit!($e);
  };
}